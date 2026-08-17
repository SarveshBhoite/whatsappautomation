import { NextRequest, NextResponse } from 'next/server';
import { saveWhatsAppConnection } from '@/lib/metaStore';

// ---------------------------------------------------------------------------
// Helper: Discover all WABAs and phone numbers linked to a given access token
// ---------------------------------------------------------------------------
async function discoverPhoneNumbers(accessToken: string, graphVersion: string) {
  const rawPhoneList: any[] = [];
  const discoveredWabaIds = new Set<string>();
  let fetchedBusinessName = '';

  console.log('[Meta Discovery]: Querying /me for all business assets linked to token...');
  try {
    const meUrl =
      `https://graph.facebook.com/${graphVersion}/me` +
      `?fields=id,name` +
      `,businesses{id,name` +
        `,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}` +
        `,client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}` +
      `}` +
      `,assigned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}` +
      `&access_token=${accessToken}`;

    const meRes  = await fetch(meUrl, { cache: 'no-store' });
    const meData = await meRes.json();

    if (!meRes.ok) {
      console.warn('[Meta Discovery]: /me request failed:', JSON.stringify(meData));
    } else {
      console.log('[Meta Discovery]: /me OK → id:', meData.id, '| name:', meData.name);
      if (meData.name) fetchedBusinessName = meData.name;

      const assigned = meData.assigned_whatsapp_business_accounts?.data || [];
      console.log('[Meta Discovery]: assigned_whatsapp_business_accounts:', assigned.length);
      assigned.forEach((w: any) => {
        if (w.id) discoveredWabaIds.add(w.id);
        (w.phone_numbers?.data || []).forEach((p: any) =>
          rawPhoneList.push({ ...p, waba_id: w.id, waba_name: w.name })
        );
      });

      const businesses = meData.businesses?.data || [];
      console.log('[Meta Discovery]: business portfolios:', businesses.length);
      businesses.forEach((b: any) => {
        if (b.name && !fetchedBusinessName) fetchedBusinessName = b.name;
        const bWabas = [
          ...(b.owned_whatsapp_business_accounts?.data || []),
          ...(b.client_whatsapp_business_accounts?.data || []),
        ];
        bWabas.forEach((w: any) => {
          if (w.id) discoveredWabaIds.add(w.id);
          (w.phone_numbers?.data || []).forEach((p: any) =>
            rawPhoneList.push({ ...p, waba_id: w.id, waba_name: w.name || b.name })
          );
        });
      });
    }
  } catch (meErr) {
    console.error('[Meta Discovery]: /me exception:', meErr);
  }

  // Query phone_numbers for each WABA directly (more reliable)
  for (const wabaId of Array.from(discoveredWabaIds)) {
    try {
      console.log('[Meta Discovery]: Fetching phone_numbers for WABA:', wabaId);
      const listRes = await fetch(
        `https://graph.facebook.com/${graphVersion}/${wabaId}/phone_numbers` +
        `?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type` +
        `&access_token=${accessToken}`,
        { cache: 'no-store' }
      );
      const listData = await listRes.json();
      if (listRes.ok && listData.data) {
        console.log(`[Meta Discovery]: WABA ${wabaId} → ${listData.data.length} numbers`);
        listData.data.forEach((p: any) => rawPhoneList.push({ ...p, waba_id: wabaId }));
      } else {
        console.warn(`[Meta Discovery]: WABA ${wabaId} phone_numbers error:`, JSON.stringify(listData));
      }
    } catch (wabaErr) {
      console.warn('[Meta Discovery]: WABA phone_numbers exception:', wabaId, wabaErr);
    }
  }

  const uniqueMap = new Map<string, any>();
  rawPhoneList.forEach((p) => { if (p.id && !uniqueMap.has(p.id)) uniqueMap.set(p.id, p); });
  const deduped = Array.from(uniqueMap.values());
  console.log('[Meta Discovery]: Total unique phone numbers:', deduped.length);

  return { deduped, discoveredWabaIds, fetchedBusinessName };
}

// ---------------------------------------------------------------------------
// POST /api/auth/whatsapp/exchange
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, waba_id, phone_number_id } = body;

    console.log('[Meta OAuth Exchange]: Payload received →', {
      code: code ? '***PRESENT***' : 'MISSING',
      waba_id: waba_id || 'none',
      phone_number_id: phone_number_id || 'none',
    });

    const appId        = process.env.NEXT_PUBLIC_META_APP_ID || process.env.META_APP_ID;
    const appSecret    = process.env.META_APP_SECRET;
    const systemToken  = process.env.META_SYSTEM_USER_TOKEN;
    const graphVersion = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v20.0';

    // Case A: No code — direct waba_id/phone_number_id payload
    if (!code) {
      console.log('[Meta OAuth Exchange]: No code — using direct waba_id/phone_number_id payload.');
      if (waba_id || phone_number_id) {
        const saved = saveWhatsAppConnection({ wabaId: waba_id, phoneNumberId: phone_number_id });
        return NextResponse.json({
          success: true,
          wabaId: saved.wabaId,
          phoneNumberId: saved.phoneNumberId,
          phoneNumber: saved.phoneNumber,
          phoneNumbers: saved.phoneNumbers,
        });
      }
      return NextResponse.json({ success: false, error: 'Missing required parameter: code' }, { status: 400 });
    }

    // Step 1: Exchange code for user access token
    let userAccessToken = '';
    if (appId && appSecret && appSecret !== 'your_meta_app_secret_here') {
      console.log('[Meta OAuth Exchange]: Exchanging authorization code for access token...');
      const loginSuccessUri = encodeURIComponent('https://www.facebook.com/connect/login_success.html');
      const tokenUrl =
        `https://graph.facebook.com/${graphVersion}/oauth/access_token` +
        `?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${loginSuccessUri}`;
      const tokenRes  = await fetch(tokenUrl, { method: 'GET', cache: 'no-store' });
      const tokenData = await tokenRes.json();
      if (tokenRes.ok && tokenData.access_token) {
        userAccessToken = tokenData.access_token;
        console.log('[Meta OAuth Exchange]: User access token obtained successfully.');
      } else {
        console.warn('[Meta OAuth Exchange]: Token exchange failed:', JSON.stringify(tokenData));
      }
    } else {
      console.warn('[Meta OAuth Exchange]: META_APP_SECRET not set — treating code as token directly.');
      userAccessToken = code;
    }

    // Step 2: Discover phones using user token, then fall back to system token
    let deduped: any[] = [];
    let discoveredWabaIds = new Set<string>();
    let fetchedBusinessName = '';

    if (userAccessToken) {
      console.log('[Meta OAuth Exchange]: Running discovery with user access token...');
      const result = await discoverPhoneNumbers(userAccessToken, graphVersion);
      deduped = result.deduped;
      discoveredWabaIds = result.discoveredWabaIds;
      fetchedBusinessName = result.fetchedBusinessName;
    }

    if (deduped.length === 0 && systemToken) {
      console.log('[Meta OAuth Exchange]: User token discovery returned 0 results. Falling back to META_SYSTEM_USER_TOKEN...');
      const sysResult = await discoverPhoneNumbers(systemToken, graphVersion);
      deduped = sysResult.deduped;
      discoveredWabaIds = sysResult.discoveredWabaIds;
      if (sysResult.fetchedBusinessName) fetchedBusinessName = sysResult.fetchedBusinessName;
    }

    if (waba_id) discoveredWabaIds.add(waba_id);

    // Step 3: Map phone list with metadata
    const allPhoneNumbers = deduped.map((p: any, idx: number) => ({
      id: p.id,
      display_phone_number: p.display_phone_number || p.id,
      verified_name: p.verified_name || p.waba_name || fetchedBusinessName || '',
      quality_rating: p.quality_rating || 'GREEN',
      code_verification_status: p.code_verification_status || 'VERIFIED',
      platform_type: p.platform_type || 'CLOUD_API',
      waba_id: p.waba_id || waba_id || '',
      is_primary: phone_number_id ? p.id === phone_number_id : idx === 0,
    }));

    console.log('[Meta OAuth Exchange]: allPhoneNumbers count:', allPhoneNumbers.length);
    allPhoneNumbers.forEach((p, i) =>
      console.log(`  [${i}] id=${p.id} | number=${p.display_phone_number} | waba=${p.waba_id}`)
    );

    const matchingPhone = phone_number_id
      ? deduped.find((p: any) => p.id === phone_number_id) || deduped[0]
      : deduped[0];

    const fetchedPhone            = matchingPhone?.display_phone_number || matchingPhone?.id || '';
    const fetchedVerifiedName     = matchingPhone?.verified_name || fetchedBusinessName;
    const fetchedQualityRating    = matchingPhone?.quality_rating || 'UNKNOWN';
    const fetchedCodeVerification = matchingPhone?.code_verification_status || 'UNKNOWN';

    // Step 4: Determine final WABA ID
    const primaryWabaId = allPhoneNumbers[0]?.waba_id || waba_id || Array.from(discoveredWabaIds)[0] || '';
    const allWabaIds    = Array.from(discoveredWabaIds).join(',');
    const finalWabaId   = allWabaIds || primaryWabaId;

    // Step 5: Subscribe WABAs to tech-provider webhook
    const tokenForOps = userAccessToken || systemToken || '';
    let subscribed = false;
    for (const singleWaba of Array.from(discoveredWabaIds)) {
      try {
        console.log('[Meta OAuth Subscribe]: Subscribing WABA:', singleWaba);
        const subRes  = await fetch(
          `https://graph.facebook.com/${graphVersion}/${singleWaba}/subscribed_apps`,
          { method: 'POST', headers: { Authorization: `Bearer ${tokenForOps}` }, cache: 'no-store' }
        );
        const subData = await subRes.json();
        if (subRes.ok && subData.success) {
          subscribed = true;
          console.log('[Meta OAuth Subscribe]: OK →', singleWaba);
        } else {
          console.warn('[Meta OAuth Subscribe]: Failed →', singleWaba, JSON.stringify(subData));
        }
      } catch (subErr) {
        console.error('[Meta OAuth Subscribe]: Exception →', singleWaba, subErr);
      }
    }

    // Step 6: Save to in-memory store
    const activePhoneId = phone_number_id || allPhoneNumbers[0]?.id || '';
    const savedStatus = saveWhatsAppConnection({
      wabaId: finalWabaId,
      phoneNumberId: activePhoneId,
      phoneNumber: fetchedPhone,
      verifiedName: fetchedVerifiedName,
      businessName: fetchedBusinessName,
      qualityRating: fetchedQualityRating,
      codeVerificationStatus: fetchedCodeVerification,
      phoneNumbers: allPhoneNumbers.length > 0 ? allPhoneNumbers : undefined,
      accessToken: tokenForOps,
    });

    console.log('[Meta OAuth Exchange]: In-memory store updated. phoneNumbers:', savedStatus.phoneNumbers?.length);

    // Step 7: Persist to backend database
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      console.log('[Meta OAuth DB Sync]: Persisting to backend:', backendUrl);
      const dbRes = await fetch(`${backendUrl}/api/admin/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-organization-id': 'demo-org-123' },
        body: JSON.stringify({
          wabaId: finalWabaId,
          phoneNumberId: activePhoneId,
          accessToken: tokenForOps,
          businessName: fetchedBusinessName,
          phoneNumbers: allPhoneNumbers,
        }),
      });
      if (dbRes.ok) {
        console.log('[Meta OAuth DB Sync]: Success.');
      } else {
        console.warn('[Meta OAuth DB Sync]: Backend error:', await dbRes.text());
      }
    } catch (dbErr) {
      console.warn('[Meta OAuth DB Sync]: Exception:', dbErr);
    }

    // Step 8: Return
    return NextResponse.json({
      success: true,
      accessToken: savedStatus.accessToken,
      wabaId: savedStatus.wabaId,
      phoneNumberId: savedStatus.phoneNumberId,
      phoneNumber: savedStatus.phoneNumber,
      verifiedName: savedStatus.verifiedName,
      businessName: savedStatus.businessName,
      qualityRating: savedStatus.qualityRating,
      codeVerificationStatus: savedStatus.codeVerificationStatus,
      phoneNumbers: savedStatus.phoneNumbers,
      subscribed,
    });
  } catch (error: any) {
    console.error('[Meta OAuth Exchange]: Unhandled exception:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to exchange token with Meta' },
      { status: 500 }
    );
  }
}

