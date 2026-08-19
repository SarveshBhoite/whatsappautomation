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

  // Query /me/businesses dynamically for all business portfolios linked to this token
  const discoveredBizIds = new Set<string>();
  try {
    const bizRes = await fetch(
      `https://graph.facebook.com/${graphVersion}/me/businesses?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}},client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}&access_token=${accessToken}`,
      { cache: 'no-store' }
    );
    const bizData = await bizRes.json();
    if (!bizRes.ok) {
      console.warn('[Meta Discovery]: /me/businesses error response:', JSON.stringify(bizData));
    } else if (bizData.data) {
      console.log(`[Meta Discovery]: /me/businesses returned ${bizData.data.length} portfolio(s).`);
      bizData.data.forEach((b: any) => {
        if (b.id) discoveredBizIds.add(b.id);
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
  } catch (bizErr) {
    console.warn('[Meta Discovery]: /me/businesses exception:', bizErr);
  }

  // Query each dynamically discovered Business Portfolio ID
  for (const bId of Array.from(discoveredBizIds)) {
    try {
      console.log('[Meta Discovery]: Dynamically querying Business Portfolio ID:', bId);
      const singleBizRes = await fetch(
        `https://graph.facebook.com/${graphVersion}/${bId}?fields=id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}},client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}&access_token=${accessToken}`,
        { cache: 'no-store' }
      );
      const singleBizData = await singleBizRes.json();
      if (singleBizRes.ok && singleBizData) {
        if (singleBizData.name && !fetchedBusinessName) fetchedBusinessName = singleBizData.name;
        const bWabas = [
          ...(singleBizData.owned_whatsapp_business_accounts?.data || []),
          ...(singleBizData.client_whatsapp_business_accounts?.data || []),
        ];
        bWabas.forEach((w: any) => {
          if (w.id) discoveredWabaIds.add(w.id);
          (w.phone_numbers?.data || []).forEach((p: any) =>
            rawPhoneList.push({ ...p, waba_id: w.id, waba_name: w.name || singleBizData.name })
          );
        });
      }
    } catch (singleErr) {
      console.warn(`[Meta Discovery]: Business portfolio ${bId} query exception:`, singleErr);
    }
  }

  // Fallback 2: Query valid assigned_whatsapp_business_accounts edge on /me
  try {
    const assignedRes = await fetch(
      `https://graph.facebook.com/${graphVersion}/me/assigned_whatsapp_business_accounts?fields=id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}&access_token=${accessToken}`,
      { cache: 'no-store' }
    );
    const assignedData = await assignedRes.json();
    if (assignedRes.ok && assignedData.data) {
      console.log(`[Meta Discovery]: /me/assigned_whatsapp_business_accounts returned ${assignedData.data.length} account(s).`);
      assignedData.data.forEach((w: any) => {
        if (w.id) discoveredWabaIds.add(w.id);
        (w.phone_numbers?.data || []).forEach((p: any) =>
          rawPhoneList.push({ ...p, waba_id: w.id, waba_name: w.name })
        );
      });
    }
  } catch (assignedErr) {
    console.warn('[Meta Discovery]: assigned_whatsapp_business_accounts exception:', assignedErr);
  }

  // Dynamic discovery via /me/adaccounts for any business portfolios linked to ad accounts
  try {
    const adAccRes = await fetch(
      `https://graph.facebook.com/${graphVersion}/me/adaccounts?fields=id,name,business{id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}},client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}}&access_token=${accessToken}`,
      { cache: 'no-store' }
    );
    const adAccData = await adAccRes.json();
    if (adAccRes.ok && adAccData.data) {
      console.log(`[Meta Discovery]: /me/adaccounts returned ${adAccData.data.length} ad account(s).`);
      adAccData.data.forEach((adAcc: any) => {
        if (adAcc.business) {
          if (adAcc.business.name && !fetchedBusinessName) fetchedBusinessName = adAcc.business.name;
          const bWabas = [
            ...(adAcc.business.owned_whatsapp_business_accounts?.data || []),
            ...(adAcc.business.client_whatsapp_business_accounts?.data || []),
          ];
          bWabas.forEach((w: any) => {
            if (w.id) discoveredWabaIds.add(w.id);
            (w.phone_numbers?.data || []).forEach((p: any) =>
              rawPhoneList.push({ ...p, waba_id: w.id, waba_name: w.name || adAcc.business.name })
            );
          });
        }
      });
    }
  } catch (adAccErr) {
    console.warn('[Meta Discovery]: /me/adaccounts exception:', adAccErr);
  }

  // Fallback 3: Query Ad Account ID / Environment Business Portfolio ID directly if available
  const adAccountId = process.env.META_AD_ACCOUNT_ID || process.env.NEXT_PUBLIC_META_AD_ACCOUNT_ID;
  if (adAccountId) {
    try {
      const cleanAdId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      console.log('[Meta Discovery]: Querying Ad Account for linked Business Portfolio:', cleanAdId);
      const adRes = await fetch(
        `https://graph.facebook.com/${graphVersion}/${cleanAdId}?fields=id,name,business{id,name,owned_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}},client_whatsapp_business_accounts{id,name,phone_numbers{id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type}}}&access_token=${accessToken}`,
        { cache: 'no-store' }
      );
      const adData = await adRes.json();
      if (adRes.ok && adData.business) {
        if (adData.business.name && !fetchedBusinessName) fetchedBusinessName = adData.business.name;
        const adWabas = [
          ...(adData.business.owned_whatsapp_business_accounts?.data || []),
          ...(adData.business.client_whatsapp_business_accounts?.data || []),
        ];
        adWabas.forEach((w: any) => {
          if (w.id) discoveredWabaIds.add(w.id);
          (w.phone_numbers?.data || []).forEach((p: any) =>
            rawPhoneList.push({ ...p, waba_id: w.id, waba_name: w.name || adData.business.name })
          );
        });
      }
    } catch (adErr) {
      console.warn('[Meta Discovery]: Ad account discovery exception:', adErr);
    }
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

    // Case A: No code or blank redirect URL — fall back to System User Token discovery
    const cleanCode = (code || '').replace(/#.*$/, '').trim();
    const isUrlWithoutCode =
      (cleanCode.startsWith('http://') || cleanCode.startsWith('https://')) &&
      !cleanCode.includes('code=');

    if (!code || isUrlWithoutCode) {
      console.log('[Meta OAuth Exchange]: No valid code parameter found — attempting dynamic discovery using system user token...');
      if (systemToken) {
        const discoveryResult = await discoverPhoneNumbers(systemToken, graphVersion);
        if (discoveryResult.deduped.length > 0) {
          const allPhoneNumbers = discoveryResult.deduped.map((p: any, idx: number) => ({
            id: p.id,
            display_phone_number: p.display_phone_number || p.id,
            verified_name: p.verified_name || p.waba_name || discoveryResult.fetchedBusinessName || '',
            quality_rating: p.quality_rating || 'GREEN',
            code_verification_status: p.code_verification_status || 'VERIFIED',
            platform_type: p.platform_type || 'CLOUD_API',
            waba_id: p.waba_id || waba_id || '',
            is_primary: idx === 0,
          }));

          const primaryWaba = Array.from(discoveryResult.discoveredWabaIds).join(',') || waba_id || '';
          const activePhoneId = allPhoneNumbers[0]?.id || '';

          const savedStatus = saveWhatsAppConnection({
            wabaId: primaryWaba,
            phoneNumberId: activePhoneId,
            phoneNumber: allPhoneNumbers[0]?.display_phone_number || '',
            verifiedName: allPhoneNumbers[0]?.verified_name || discoveryResult.fetchedBusinessName,
            businessName: discoveryResult.fetchedBusinessName,
            qualityRating: allPhoneNumbers[0]?.quality_rating || 'GREEN',
            codeVerificationStatus: allPhoneNumbers[0]?.code_verification_status || 'VERIFIED',
            phoneNumbers: allPhoneNumbers,
            accessToken: systemToken,
          });

          return NextResponse.json({
            success: true,
            accessToken: savedStatus.accessToken,
            wabaId: savedStatus.wabaId,
            phoneNumberId: savedStatus.phoneNumberId,
            phoneNumber: savedStatus.phoneNumber,
            verifiedName: savedStatus.verifiedName,
            businessName: savedStatus.businessName,
            phoneNumbers: savedStatus.phoneNumbers,
          });
        }
      }

      const hasValidManualIds =
        (waba_id && waba_id !== 'none') ||
        (phone_number_id && phone_number_id !== 'none');

      if (hasValidManualIds) {
        const saved = saveWhatsAppConnection({
          wabaId: waba_id !== 'none' ? waba_id : '',
          phoneNumberId: phone_number_id !== 'none' ? phone_number_id : '',
        });
        return NextResponse.json({
          success: true,
          wabaId: saved.wabaId,
          phoneNumberId: saved.phoneNumberId,
          phoneNumber: saved.phoneNumber,
          phoneNumbers: saved.phoneNumbers,
        });
      }

      return NextResponse.json(
        {
          success: false,
          error:
            'No authorization code or linked Meta WhatsApp accounts found. Please complete the Embedded Signup flow or check your Meta System User permissions.',
        },
        { status: 400 }
      );
    }

    // Step 1: Exchange code for user access token
    let userAccessToken = '';
    if (appId && appSecret && appSecret !== 'your_meta_app_secret_here') {
      console.log('[Meta OAuth Exchange]: Exchanging authorization code for access token...');
      const loginSuccessUri = encodeURIComponent('https://www.facebook.com/connect/login_success.html');
      
      // Attempt 1: Try exchange with redirect_uri
      let tokenUrl =
        `https://graph.facebook.com/${graphVersion}/oauth/access_token` +
        `?client_id=${appId}&client_secret=${appSecret}&code=${cleanCode}&redirect_uri=${loginSuccessUri}`;
      let tokenRes  = await fetch(tokenUrl, { method: 'GET', cache: 'no-store' });
      let tokenData = await tokenRes.json();

      if (tokenRes.ok && tokenData.access_token) {
        userAccessToken = tokenData.access_token;
        console.log('[Meta OAuth Exchange]: User access token obtained successfully (with redirect_uri).');
      } else {
        console.warn('[Meta OAuth Exchange]: Primary token exchange returned error:', JSON.stringify(tokenData));
        // Attempt 2: Try exchange without redirect_uri (for FB.login SDK codes)
        console.log('[Meta OAuth Exchange]: Retrying token exchange without redirect_uri...');
        tokenUrl =
          `https://graph.facebook.com/${graphVersion}/oauth/access_token` +
          `?client_id=${appId}&client_secret=${appSecret}&code=${cleanCode}`;
        tokenRes  = await fetch(tokenUrl, { method: 'GET', cache: 'no-store' });
        tokenData = await tokenRes.json();

        if (tokenRes.ok && tokenData.access_token) {
          userAccessToken = tokenData.access_token;
          console.log('[Meta OAuth Exchange]: User access token obtained successfully (without redirect_uri).');
        } else {
          console.warn('[Meta OAuth Exchange]: Secondary token exchange failed:', JSON.stringify(tokenData));
          // Attempt 3: If code exchange failed, test if the passed string is already a direct access token
          try {
            console.log('[Meta OAuth Exchange]: Testing if code is already a valid access token...');
            const testRes = await fetch(
              `https://graph.facebook.com/${graphVersion}/me?access_token=${cleanCode}`,
              { cache: 'no-store' }
            );
            const testData = await testRes.json();
            if (testRes.ok && testData.id) {
              userAccessToken = cleanCode;
              console.log('[Meta OAuth Exchange]: Verified cleanCode is a valid user access token for user:', testData.id);
            }
          } catch (testErr) {
            console.warn('[Meta OAuth Exchange]: Token test check failed:', testErr);
          }
        }
      }
    } else {
      console.warn('[Meta OAuth Exchange]: META_APP_SECRET not set — treating code as token directly.');
      userAccessToken = code;
    }

    // Step 2: Discover phones using user token or system token
    let deduped: any[] = [];
    let discoveredWabaIds = new Set<string>();
    let fetchedBusinessName = '';

    if (waba_id) discoveredWabaIds.add(waba_id);

    const activeToken = userAccessToken || systemToken || '';

    if (activeToken) {
      console.log(`[Meta OAuth Exchange]: Running discovery with active token (${userAccessToken ? 'User Token' : 'System Token'})...`);
      const result = await discoverPhoneNumbers(activeToken, graphVersion);
      deduped = result.deduped;
      result.discoveredWabaIds.forEach((id) => discoveredWabaIds.add(id));
      if (result.fetchedBusinessName) fetchedBusinessName = result.fetchedBusinessName;
    }

    // Direct fetch for passed waba_id if phone numbers were not discovered via /me
    if (waba_id && activeToken && deduped.length === 0) {
      try {
        console.log('[Meta OAuth Exchange]: Direct phone numbers query for passed WABA ID:', waba_id);
        const wabaPhoneRes = await fetch(
          `https://graph.facebook.com/${graphVersion}/${waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${activeToken}`,
          { cache: 'no-store' }
        );
        const wabaPhoneData = await wabaPhoneRes.json();
        if (wabaPhoneRes.ok && wabaPhoneData.data) {
          console.log(`[Meta OAuth Exchange]: Found ${wabaPhoneData.data.length} number(s) for WABA ${waba_id}`);
          wabaPhoneData.data.forEach((p: any) => deduped.push({ ...p, waba_id }));
        } else {
          console.warn('[Meta OAuth Exchange]: Direct WABA query error:', wabaPhoneData);
        }
      } catch (directErr) {
        console.warn('[Meta OAuth Exchange]: Direct WABA query exception:', directErr);
      }
    }

    // Direct fetch for passed phone_number_id if still empty
    if (phone_number_id && activeToken && deduped.length === 0) {
      try {
        console.log('[Meta OAuth Exchange]: Direct phone node fetch for ID:', phone_number_id);
        const nodeRes = await fetch(
          `https://graph.facebook.com/${graphVersion}/${phone_number_id}?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,platform_type&access_token=${activeToken}`,
          { cache: 'no-store' }
        );
        const nodeData = await nodeRes.json();
        if (nodeRes.ok && nodeData.id) {
          console.log('[Meta OAuth Exchange]: Found phone node:', nodeData.display_phone_number || nodeData.id);
          deduped.push({ ...nodeData, waba_id: waba_id || '' });
        }
      } catch (nodeErr) {
        console.warn('[Meta OAuth Exchange]: Direct phone node fetch exception:', nodeErr);
      }
    }

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

    // If discovery yielded 0 phone numbers and we failed to get a user access token, report informative error
    if (allPhoneNumbers.length === 0 && !userAccessToken && !waba_id && !phone_number_id) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid authorization code provided or no WhatsApp Business accounts found linked to this Meta login. Please ensure your Meta account has an active WhatsApp Business Account.',
        },
        { status: 400 }
      );
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

