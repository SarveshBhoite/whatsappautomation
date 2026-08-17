import { NextRequest, NextResponse } from 'next/server';
import {
  getMetaConnectionStatus,
  saveWhatsAppConnection,
  saveInstagramConnection,
  disconnectWhatsApp,
  disconnectInstagram,
  setActiveWhatsAppPhoneNumber,
  setActiveInstagramAccount,
} from '@/lib/metaStore';

export async function GET(req: NextRequest) {
  try {
    let status = getMetaConnectionStatus();

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      
      // 1. Sync WhatsApp Config
      const configRes = await fetch(`${backendUrl}/api/admin/config`, {
        headers: { 'x-organization-id': 'demo-org-123' },
        cache: 'no-store',
      });

      if (configRes.ok) {
        const config = await configRes.json();
        const systemToken = process.env.META_SYSTEM_USER_TOKEN;
        // Use the stored access token, or fall back to the system user token for server-side discovery
        const effectiveToken = (config && config.accessToken) ? config.accessToken : systemToken;

        if (effectiveToken && (config?.wabaId || systemToken)) {
          // If in-memory state is empty or differs from database WABA ID, sync from Graph API
          if (!status.whatsapp.connected || status.whatsapp.wabaId !== config?.wabaId || !status.whatsapp.phoneNumbers || status.whatsapp.phoneNumbers.length === 0) {
            const graphVersion = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v20.0';
            // Env-level known WABA IDs (comma-separated fallback for system-user-only setups)
            const envWabaIds = (process.env.META_WABA_IDS || '').split(',').map((s: string) => s.trim()).filter(Boolean);

            let rawPhones: any[] = [];
            let businessName = '';

            // 1. Dynamic Discovery via Connected Facebook Account (/me)
            try {
              const meRes = await fetch(
                `https://graph.facebook.com/${graphVersion}/me?fields=id,name,businesses{id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}},client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}},assigned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}&access_token=${effectiveToken}`,
                { cache: 'no-store' }
              );

              if (meRes.ok) {
                const meData = await meRes.json();
                if (meData.name) businessName = meData.name;

                // Collect from assigned_whatsapp_business_accounts
                if (meData.assigned_whatsapp_business_accounts?.data) {
                  meData.assigned_whatsapp_business_accounts.data.forEach((waba: any) => {
                    if (waba.phone_numbers?.data) {
                      waba.phone_numbers.data.forEach((p: any) => {
                        rawPhones.push({ ...p, waba_id: waba.id, waba_name: waba.name });
                      });
                    }
                  });
                }

                // Collect from businesses (owned & client)
                if (meData.businesses?.data) {
                  meData.businesses.data.forEach((biz: any) => {
                    if (biz.name && !businessName) businessName = biz.name;
                    const bizWabas = [
                      ...(biz.owned_whatsapp_business_accounts?.data || []),
                      ...(biz.client_whatsapp_business_accounts?.data || [])
                    ];
                    bizWabas.forEach((waba: any) => {
                      if (waba.phone_numbers?.data) {
                        waba.phone_numbers.data.forEach((p: any) => {
                          rawPhones.push({ ...p, waba_id: waba.id, waba_name: waba.name });
                        });
                      }
                    });
                  });
                }
              }
            } catch (meErr) {
              console.warn('[Dynamic FB Account Discovery Warning]:', meErr);
            }

            // 2. Query configured WABA ID(s) from DB config + env fallback
            const configuredWabaIds = Array.from(new Set([
              ...(config?.wabaId || '').split(/[\s,]+/).map((s: string) => s.trim()).filter(Boolean),
              ...envWabaIds,
            ]));
            console.log('[Status Route]: Querying WABA IDs:', configuredWabaIds);
            for (const currentWabaId of configuredWabaIds) {
              try {
                const graphRes = await fetch(
                  `https://graph.facebook.com/${graphVersion}/${currentWabaId}?fields=id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}&access_token=${effectiveToken}`,
                  { cache: 'no-store' }
                );
                if (graphRes.ok) {
                  const graphData = await graphRes.json();
                  if (graphData.name && !businessName) businessName = graphData.name;
                  if (graphData.phone_numbers?.data) {
                    graphData.phone_numbers.data.forEach((p: any) => {
                      rawPhones.push({
                        ...p,
                        waba_id: currentWabaId,
                        waba_name: graphData.name || currentWabaId,
                      });
                    });
                  }
                }
              } catch (wabaErr) {
                console.warn('[WABA Query Warning]:', wabaErr);
              }

              try {
                const listRes = await fetch(
                  `https://graph.facebook.com/${graphVersion}/${currentWabaId}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${effectiveToken}`,
                  { cache: 'no-store' }
                );
                if (listRes.ok) {
                  const listData = await listRes.json();
                  if (listData.data && Array.isArray(listData.data)) {
                    listData.data.forEach((p: any) => {
                      rawPhones.push({
                        ...p,
                        waba_id: currentWabaId,
                      });
                    });
                  }
                }
              } catch (listErr) {
                console.warn('[WABA Phone Numbers List Warning]:', listErr);
              }
            }

            // Deduplicate phone numbers by ID
            const uniquePhoneMap = new Map();
            rawPhones.forEach((p: any) => {
              if (p.id && !uniquePhoneMap.has(p.id)) {
                uniquePhoneMap.set(p.id, p);
              }
            });

            let mappedPhones = Array.from(uniquePhoneMap.values()).map((p: any, idx: number) => ({
              id: p.id,
              display_phone_number: p.display_phone_number || p.id,
              verified_name: p.verified_name || p.waba_name || businessName,
              quality_rating: p.quality_rating || 'GREEN',
              code_verification_status: p.code_verification_status || 'VERIFIED',
              platform_type: p.platform_type || 'CLOUD_API',
              waba_id: p.waba_id,
              is_primary: config?.phoneNumberId ? p.id === config.phoneNumberId : idx === 0,
            }));

            // 3. Fallback: If no phone numbers returned, but phoneNumberId is configured, query the phone node directly
            if (mappedPhones.length === 0 && config.phoneNumberId) {
              try {
                const phoneNodeRes = await fetch(
                  `https://graph.facebook.com/${graphVersion}/${config.phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${effectiveToken}`,
                  { cache: 'no-store' }
                );
                if (phoneNodeRes.ok) {
                  const phoneNodeData = await phoneNodeRes.json();
                  mappedPhones = [{
                    id: phoneNodeData.id || config.phoneNumberId,
                    display_phone_number: phoneNodeData.display_phone_number || phoneNodeData.id || config.phoneNumberId,
                    verified_name: phoneNodeData.verified_name || businessName,
                    quality_rating: phoneNodeData.quality_rating || 'UNKNOWN',
                    code_verification_status: phoneNodeData.code_verification_status || 'UNKNOWN',
                    platform_type: phoneNodeData.platform_type || 'CLOUD_API',
                    waba_id: config.wabaId || '',
                    is_primary: true,
                  }];
                }
              } catch (phoneErr) {
                console.warn('[Phone Node Fetch Warning]:', phoneErr);
              }
            }

            const activePhone = mappedPhones.find((p: any) => p.id === config?.phoneNumberId) || mappedPhones[0];

            if (mappedPhones.length > 0 || config?.phoneNumberId) {
              saveWhatsAppConnection({
                wabaId: config?.wabaId || '',
                phoneNumberId: activePhone?.id || config?.phoneNumberId,
                phoneNumber: activePhone?.display_phone_number || config?.phoneNumberId,
                verifiedName: activePhone?.verified_name || businessName,
                businessName: businessName,
                qualityRating: activePhone?.quality_rating || 'UNKNOWN',
                codeVerificationStatus: activePhone?.code_verification_status || 'UNKNOWN',
                phoneNumbers: mappedPhones,
                accessToken: effectiveToken,
              });

              status = getMetaConnectionStatus();
            }
          }
        }
      }

      // 2. Sync Instagram Config from DB & live profile
      const igConfigRes = await fetch(`${backendUrl}/api/admin/instagram/config`, {
        headers: { 'x-organization-id': 'demo-org-123' },
        cache: 'no-store',
      });

      if (igConfigRes.ok) {
        const igConfig = await igConfigRes.json();
        if (igConfig && igConfig.pageAccessToken) {
          const liveProfile = igConfig.liveProfile;
          const profilePic = liveProfile?.profile_picture_url || igConfig.profilePictureUrl || undefined;
          const accountType = liveProfile?.account_type || igConfig.accountType || 'Professional Account (Business)';
          const username = liveProfile?.username || igConfig.username || undefined;
          const name = liveProfile?.name || igConfig.name || undefined;
          const igId = igConfig.instagramAccountId || liveProfile?.id || undefined;
          const pageId = igConfig.pageId || undefined;

          if (!status.instagram.connected || status.instagram.instagramAccountId !== igId || status.instagram.profilePictureUrl !== profilePic) {
            saveInstagramConnection({
              instagramAccountId: igId,
              pageId: pageId,
              username,
              name,
              profilePictureUrl: profilePic,
              accountType,
              verificationStatus: 'Verified & Active',
              followersCount: liveProfile?.followers_count ?? igConfig.followersCount ?? undefined,
              mediaCount: liveProfile?.media_count ?? igConfig.mediaCount ?? undefined,
              accessToken: igConfig.pageAccessToken,
              accounts: [
                {
                  id: pageId || igId || 'primary',
                  name: name || username || 'Instagram Account',
                  profile_picture_url: profilePic,
                  account_type: accountType,
                  instagram_business_account: {
                    id: igId || 'primary',
                    username: username || '',
                    name: name,
                    profile_picture_url: profilePic,
                    account_type: accountType,
                  },
                  is_primary: true,
                },
              ],
            });
            status = getMetaConnectionStatus();
          }
        }
      }
    } catch (dbErr) {
      console.warn('[Meta Status Sync Warning]:', dbErr);
    }

    return NextResponse.json({ success: true, data: status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch status' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, phoneNumberId, instagramAccountId } = body;

    if (platform === 'whatsapp' && phoneNumberId) {
      const data = setActiveWhatsAppPhoneNumber(phoneNumberId);
      return NextResponse.json({ success: true, platform: 'whatsapp', data });
    } else if (platform === 'instagram' && instagramAccountId) {
      const data = setActiveInstagramAccount(instagramAccountId);
      return NextResponse.json({ success: true, platform: 'instagram', data });
    }

    return NextResponse.json(
      { success: false, error: 'Missing required parameters' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update active item' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');

    if (platform === 'whatsapp') {
      const data = disconnectWhatsApp();
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        await fetch(`${backendUrl}/api/admin/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': 'demo-org-123',
          },
          body: JSON.stringify({
            phoneNumberId: '',
            wabaId: '',
            accessToken: '',
            businessName: null,
            phoneNumbers: null,
          }),
        });
      } catch (e) {
        console.error('Failed to clear backend WhatsApp config on disconnect:', e);
      }
      return NextResponse.json({ success: true, platform: 'whatsapp', data });
    } else if (platform === 'instagram') {
      const data = disconnectInstagram();
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
        await fetch(`${backendUrl}/api/admin/instagram/config`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-organization-id': 'demo-org-123',
          },
          body: JSON.stringify({
            instagramAccountId: '',
            pageId: '',
            pageAccessToken: '',
            username: '',
            name: '',
            profilePictureUrl: '',
            followersCount: null,
            mediaCount: null,
          }),
        });
      } catch (e) {
        console.error('Failed to clear backend Instagram config on disconnect:', e);
      }
      return NextResponse.json({ success: true, platform: 'instagram', data });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid platform. Expected whatsapp or instagram.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}

