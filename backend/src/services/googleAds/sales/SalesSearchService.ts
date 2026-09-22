import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class SalesSearchService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const isAiGuided = payload?.source === "AI_GUIDED" || payload?.isAiGuided === true;

    const {
      campaignName = "Sales Search",
      websiteVisitsUrl = "https://www.example.com",
      finalUrl: inputFinalUrl,
      website,
      biddingFocus = "Maximize conversions",
      biddingStrategy: inputBiddingStrategy,
      targetCpa,
      targetRoas,
      maxCpcLimit,
      impressionShareLocation = "Anywhere on results page",
      targetImpressionSharePercent = 50,
      maxCpcImpressionShare,
      locations = ["India"],
      languages = ["English"],
      keywords = [],
      headlines = [],
      descriptions = [],
      images = [],
      logos = [],
      sitelinks = [],
      callouts = [],
      structuredSnippets = [],
      callAsset,
      callPhoneNumber,
      callPhone,
      promotions = [],
      prices = [],
      leadForms = [],
      dailyBudget,
      budget,
      startDate,
      endDate,
      euPolitical = "NO",
      networkSearch = true,
      networkDisplay = true,
      adRotationMode = "OPTIMIZE",
      locationOptionsPresence = "PRESENCE_INTEREST",
      locationOptionsExclude = "PRESENCE",
      trackingTemplate,
      finalUrlSuffix,
      customParameters = [],
      urlCustomParameters = [],
      enableFinalUrlExpansion = true,
      displayPath1,
      displayPath2,
      adGroupName,
      adSchedule = [],
      adScheduleList = []
    } = payload;

    const finalUrl = (inputFinalUrl || websiteVisitsUrl || website || "").trim();
    if (!finalUrl || (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://"))) {
      throw new Error("A valid landing page URL starting with http:// or https:// is required.");
    }

    const effectiveDailyBudget = Number(dailyBudget !== undefined && dailyBudget !== null && dailyBudget !== "" ? dailyBudget : (budget || 1000));
    if (isNaN(effectiveDailyBudget) || effectiveDailyBudget <= 0) {
      throw new Error("A valid positive daily budget greater than 0 is required.");
    }
    const amountMicros = Math.round(effectiveDailyBudget * 1_000_000);

    // Validation & Text Sanitization for Responsive Search Ads (RSA)
    const cleanedHeadlines = (headlines || [])
      .map((h: any) => GoogleAdsBaseService.cleanAdText(String(h || ""), 30))
      .filter((h: string) => h.length > 0);
    const validHeadlines = Array.from(new Set(cleanedHeadlines));

    const cleanedDescriptions = (descriptions || [])
      .map((d: any) => GoogleAdsBaseService.cleanAdText(String(d || ""), 90))
      .filter((d: string) => d.length > 0);
    const validDescriptions = Array.from(new Set(cleanedDescriptions));

    if (validHeadlines.length < 3) throw new Error(`At least 3 valid headlines (<= 30 chars) are required for Responsive Search Ads (provided ${validHeadlines.length}).`);
    if (validDescriptions.length < 2) throw new Error(`At least 2 valid descriptions (<= 90 chars) are required for Responsive Search Ads (provided ${validDescriptions.length}).`);
    if (!keywords || keywords.length === 0) throw new Error("At least 1 valid keyword is required.");

    // Normalize languages list (handles comma-separated string e.g. "Bengali, Hindi")
    const parsedLanguages: string[] = [];
    const rawLangList = Array.isArray(languages) ? languages : [languages].filter(Boolean);
    for (const item of rawLangList) {
      if (typeof item === "string" && item.includes(",")) {
        parsedLanguages.push(...item.split(",").map(l => l.trim()).filter(Boolean));
      } else if (item) {
        parsedLanguages.push(String(item).trim());
      }
    }
    const cleanLanguages = parsedLanguages.length > 0 ? parsedLanguages : ["English"];

    // Normalize Ad Schedule list
    const effectiveSchedule = (Array.isArray(adSchedule) && adSchedule.length > 0)
      ? adSchedule
      : (Array.isArray(adScheduleList) ? adScheduleList : []);

    // Normalize Call Asset phone & country
    const effectiveCallPhone = (callAsset?.phoneNumber || callPhoneNumber || callPhone || "").trim();
    const effectiveCallCountry = (callAsset?.countryCode || payload?.callCountryCode || "IN").trim();

    const cid = (customerId || "").replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    let apiResult: any = { campaignId: `sales-search-${Date.now()}` };
    let createdCampaignResource: string | null = null;

    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveDailyBudget
      });
      apiResult.budgetResourceName = budgetRef;

      // Construct Bidding Configuration (Google Ads API v24)
      const activeStrategy = (biddingFocus || inputBiddingStrategy || "Maximize conversions").trim();
      const normStrategy = activeStrategy.toLowerCase();

      let biddingConfig: any = {};
      let canonicalBiddingStrategy = "MAXIMIZE_CONVERSIONS";

      if (normStrategy === "target cpa" || normStrategy === "target_cpa") {
        canonicalBiddingStrategy = "TARGET_CPA";
        const cpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
        biddingConfig = {
          maximizeConversions: cpaMicros && cpaMicros > 0 ? { targetCpaMicros: String(cpaMicros) } : {}
        };
      } else if (normStrategy === "target roas" || normStrategy === "target_roas") {
        canonicalBiddingStrategy = "TARGET_ROAS";
        const rawRoas = targetRoas ? Number(targetRoas) : undefined;
        const validRoas = rawRoas ? (rawRoas > 10 ? rawRoas / 100 : rawRoas) : undefined;
        biddingConfig = {
          maximizeConversionValue: validRoas && validRoas > 0 ? { targetRoas: validRoas } : {}
        };
      } else if (normStrategy === "conversion value" || normStrategy === "maximize conversion value" || normStrategy === "maximize_conversion_value") {
        canonicalBiddingStrategy = "MAXIMIZE_CONVERSION_VALUE";
        const rawRoas = targetRoas ? Number(targetRoas) : undefined;
        const validRoas = rawRoas ? (rawRoas > 10 ? rawRoas / 100 : rawRoas) : undefined;
        biddingConfig = {
          maximizeConversionValue: validRoas && validRoas > 0 ? { targetRoas: validRoas } : {}
        };
      } else if (normStrategy === "clicks" || normStrategy === "maximize clicks" || normStrategy === "maximize_clicks") {
        canonicalBiddingStrategy = "MAXIMIZE_CLICKS";
        const ceiling = maxCpcLimit ? Math.round(Number(maxCpcLimit) * 1_000_000) : undefined;
        biddingConfig = {
          targetSpend: ceiling && ceiling > 0 ? { cpcBidCeilingMicros: String(ceiling) } : {}
        };
      } else if (normStrategy === "impression share" || normStrategy === "target impression share" || normStrategy === "target_impression_share") {
        canonicalBiddingStrategy = "TARGET_IMPRESSION_SHARE";
        const locMap: Record<string, string> = {
          "anywhere on results page": "ANYWHERE_ON_PAGE",
          "top of results page": "TOP_OF_PAGE",
          "absolute top of results page": "ABSOLUTE_TOP_OF_PAGE"
        };
        const loc = locMap[String(impressionShareLocation).toLowerCase()] || "ANYWHERE_ON_PAGE";
        const fraction = targetImpressionSharePercent ? Math.round(Number(targetImpressionSharePercent) * 10_000) : 500_000;
        const ceiling = (maxCpcImpressionShare || maxCpcLimit) ? Math.round(Number(maxCpcImpressionShare || maxCpcLimit) * 1_000_000) : undefined;
        biddingConfig = {
          targetImpressionShare: {
            location: loc,
            locationFractionMicros: fraction,
            ...(ceiling && ceiling > 0 ? { cpcBidCeilingMicros: String(ceiling) } : {})
          }
        };
      } else {
        canonicalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
        const cpaMicros = targetCpa && Number(targetCpa) > 0 ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
        biddingConfig = {
          maximizeConversions: cpaMicros ? { targetCpaMicros: String(cpaMicros) } : {}
        };
      }

      const campaignPayload = {
        operations: [
          {
            create: {
              name: campaignName,
              status: "PAUSED",
              advertisingChannelType: "SEARCH",
              campaignBudget: budgetRef,
              containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
              networkSettings: {
                targetGoogleSearch: true,
                targetSearchNetwork: Boolean(networkSearch),
                targetContentNetwork: Boolean(networkDisplay),
                targetPartnerSearchNetwork: false
              },
              geoTargetTypeSetting: {
                positiveGeoTargetType: locationOptionsPresence === "PRESENCE" ? "PRESENCE" : "PRESENCE_OR_INTEREST",
                negativeGeoTargetType: locationOptionsExclude === "PRESENCE_INTEREST" ? "PRESENCE_OR_INTEREST" : "PRESENCE"
              },
              ...(trackingTemplate ? { trackingUrlTemplate: GoogleAdsBaseService.cleanTrackingTemplate(trackingTemplate) } : {}),
              ...(finalUrlSuffix ? { finalUrlSuffix: String(finalUrlSuffix).trim() } : {}),
              ...((() => {
                const rawParams = (Array.isArray(customParameters) && customParameters.length > 0)
                  ? customParameters
                  : (Array.isArray(urlCustomParameters) ? urlCustomParameters : []);
                const cleanParams = rawParams
                  .map((p: any) => {
                    const k = (p?.key || p?.name || "").trim().replace(/[^a-zA-Z0-9_]/g, "").slice(0, 16);
                    const v = String(p?.value !== undefined ? p.value : "").trim().slice(0, 250);
                    return k ? { key: k, value: v } : null;
                  })
                  .filter(Boolean);
                return cleanParams.length > 0 ? { urlCustomParameters: cleanParams } : {};
              })()),
              ...(startDate ? { startDateTime: `${String(startDate).split("T")[0]} 00:00:00` } : {}),
              ...(endDate ? { endDateTime: `${String(endDate).split("T")[0]} 23:59:59` } : {}),
              ...biddingConfig
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-search-${Date.now()}`;
      createdCampaignResource = campaignRef;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
    } catch (apiErr: any) {
      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error for Sales Search]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Sales Search API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    try {
      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const ADS_BASE = "https://googleads.googleapis.com/v24";

      // 1. Create AdGroup
      const effectiveAdGroupName = adGroupName || `${campaignName} - AdGroup 1`;
      const adGroupPayload = {
        operations: [{
          create: {
            campaign: apiResult.campaignResourceName,
            name: effectiveAdGroupName,
            status: "ENABLED",
            type: "SEARCH_STANDARD"
          }
        }]
      };
      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
      const adGroupRef = adGroupRes.data?.results?.[0]?.resourceName;
      apiResult.adGroupResourceName = adGroupRef;

      // 2. Create Keywords (AdGroupCriterion)
      const keywordOperations = keywords.map((kw: string) => {
        let matchType = "BROAD";
        let text = kw.trim();
        if (text.startsWith("[") && text.endsWith("]")) {
          matchType = "EXACT";
          text = text.slice(1, -1);
        } else if (text.startsWith('"') && text.endsWith('"')) {
          matchType = "PHRASE";
          text = text.slice(1, -1);
        }
        return {
          create: {
            adGroup: adGroupRef,
            status: "ENABLED",
            keyword: {
              text,
              matchType
            }
          }
        };
      });
      if (keywordOperations.length > 0) {
        await axios.post(`${ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`, { operations: keywordOperations }, { headers });
      }

      // 3. Create Responsive Search Ad (AdGroupAd) - Google Ads strictly allows max 15 headlines and max 4 descriptions
      const adGroupAdPayload = {
        operations: [{
          create: {
            adGroup: adGroupRef,
            status: "ENABLED",
            ad: {
              finalUrls: [finalUrl],
              responsiveSearchAd: {
                headlines: validHeadlines.slice(0, 15).map((text: any) => ({ text: String(text) })),
                descriptions: validDescriptions.slice(0, 4).map((text: any) => ({ text: String(text) })),
                ...(displayPath1 ? { path1: GoogleAdsBaseService.cleanAdText(String(displayPath1), 15) } : {}),
                ...(displayPath2 ? { path2: GoogleAdsBaseService.cleanAdText(String(displayPath2), 15) } : {})
              }
            }
          }
        }]
      };
      await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });

      // 4. Create Campaign Criteria (Locations and Languages via GoogleAdsBaseService)
      await GoogleAdsBaseService.mutateCampaignGeoAndLanguageCriteria(
        organizationId,
        customerId,
        apiResult.campaignResourceName,
        { locations, languages: cleanLanguages, headers }
      );

      // 4b. Create Campaign Criteria for Ad Schedule
      if (effectiveSchedule.length > 0) {
        try {
          await GoogleAdsBaseService.mutateCampaignAdScheduleCriteria(
            organizationId,
            customerId,
            apiResult.campaignResourceName,
            effectiveSchedule,
            headers
          );
          console.info(`[SalesSearchService] Successfully attached ${effectiveSchedule.length} ad schedule entries to campaign.`);
        } catch (schedErr: any) {
          console.warn("[SalesSearchService] Ad Schedule criteria mutate skipped / non-fatal:", schedErr?.message || schedErr);
        }
      }

      // 5. Create Search Extensions & Visual Assets (Images, Logos, Sitelinks, Callouts, etc.)
      const campaignAssetOperations: any[] = [];
      const createdAssetResources: string[] = [];

      // A. Visual Image Assets (Optional for Search ads)
      const inputImages = Array.isArray(images) ? images : [];
      for (const img of inputImages) {
        const rawUrl = typeof img === "string" ? img : img?.url || img?.data || "";
        if (rawUrl && (rawUrl.startsWith("http") || rawUrl.startsWith("data:image/"))) {
          try {
            const isSquare = (typeof img === "object" && (img.fieldType === "SQUARE_MARKETING_IMAGE" || img.aspectRatio === "1:1")) || false;
            const assetRef = await GoogleAdsBaseService.uploadImageAsset(
              organizationId,
              customerId,
              rawUrl,
              `Search Image ${Date.now()}`
            );
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: apiResult.campaignResourceName,
                  asset: assetRef,
                  fieldType: isSquare ? "SQUARE_MARKETING_IMAGE" : "MARKETING_IMAGE",
                  status: "ENABLED"
                }
              });
            }
          } catch (imgErr: any) {
            console.warn("[SalesSearchService] Image asset upload skipped / non-fatal:", imgErr?.message || imgErr);
          }
        }
      }

      // B. Visual Logo Assets (Optional for Search ads)
      const inputLogos = Array.isArray(logos) ? logos : [];
      for (const lg of inputLogos) {
        const rawUrl = typeof lg === "string" ? lg : lg?.url || lg?.data || "";
        if (rawUrl && (rawUrl.startsWith("http") || rawUrl.startsWith("data:image/"))) {
          try {
            const assetRef = await GoogleAdsBaseService.uploadImageAsset(
              organizationId,
              customerId,
              rawUrl,
              `Search Logo ${Date.now()}`
            );
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: apiResult.campaignResourceName,
                  asset: assetRef,
                  fieldType: "LOGO",
                  status: "ENABLED"
                }
              });
            }
          } catch (lgErr: any) {
            console.warn("[SalesSearchService] Logo asset upload skipped / non-fatal:", lgErr?.message || lgErr);
          }
        }
      }

      // C. Sitelinks (SitelinkAsset)
      const inputSitelinks = Array.isArray(sitelinks) ? sitelinks : [];
      for (const sl of inputSitelinks) {
        let linkText = GoogleAdsBaseService.cleanAdText(String(sl.text || sl.linkText || sl.title || ""), 25);
        let slUrl = (sl.url || sl.finalUrl || "").trim();
        if (slUrl && !slUrl.startsWith("http://") && !slUrl.startsWith("https://")) {
          slUrl = `https://${slUrl}`;
        }
        
        let desc1 = sl.desc1 || sl.description1 || sl.line1 || "";
        let desc2 = sl.desc2 || sl.description2 || sl.line2 || "";
        if (desc1) desc1 = GoogleAdsBaseService.cleanAdText(String(desc1), 35);
        if (desc2) desc2 = GoogleAdsBaseService.cleanAdText(String(desc2), 35);

        if (linkText && slUrl) {
          try {
            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [{
                create: {
                  name: `Sitelink - ${linkText.slice(0, 20)} - ${Date.now()}`,
                  sitelinkAsset: {
                    linkText,
                    ...(desc1 ? { description1: desc1 } : {}),
                    ...(desc2 ? { description2: desc2 } : {})
                  },
                  finalUrls: [slUrl]
                }
              }]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: apiResult.campaignResourceName,
                  asset: assetRef,
                  fieldType: "SITELINK",
                  status: "ENABLED"
                }
              });
            }
          } catch (slErr: any) {
            console.warn("[SalesSearchService] Sitelink creation skipped:", slErr?.response?.data || slErr?.message || slErr);
          }
        }
      }

      // D. Callouts (CalloutAsset)
      const inputCallouts = Array.isArray(callouts) ? callouts : [];
      for (const co of inputCallouts) {
        const calloutText = (typeof co === "string" ? co : co?.text || co?.calloutText || "").trim();
        if (calloutText) {
          try {
            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [{
                create: {
                  name: `Callout - ${calloutText.slice(0, 20)} - ${Date.now()}`,
                  calloutAsset: {
                    calloutText: calloutText.slice(0, 25)
                  }
                }
              }]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: apiResult.campaignResourceName,
                  asset: assetRef,
                  fieldType: "CALLOUT",
                  status: "ENABLED"
                }
              });
            }
          } catch (coErr: any) {
            console.warn("[SalesSearchService] Callout creation skipped:", coErr?.message || coErr);
          }
        }
      }

      // E. Structured Snippets (StructuredSnippetAsset)
      const inputSnippets = Array.isArray(structuredSnippets) ? structuredSnippets : [];
      for (const snip of inputSnippets) {
        const header = (snip.header || "").trim();
        const rawValues: string[] = Array.isArray(snip.values) ? snip.values : [];
        const values = rawValues.map(v => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
        if (header && header !== "Select header type" && values.length >= 3) {
          try {
            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [{
                create: {
                  name: `Snippet - ${header} - ${Date.now()}`,
                  structuredSnippetAsset: {
                    header,
                    values
                  }
                }
              }]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: apiResult.campaignResourceName,
                  asset: assetRef,
                  fieldType: "STRUCTURED_SNIPPET",
                  status: "ENABLED"
                }
              });
            }
          } catch (snipErr: any) {
            console.warn("[SalesSearchService] Structured Snippet creation skipped:", snipErr?.message || snipErr);
          }
        }
      }

      // F. Call Asset (CallAsset)
      const effectiveCallPhone = (callAsset?.phoneNumber || callPhoneNumber || callPhone || "").trim();
      const effectiveCallCountry = (callAsset?.countryCode || payload?.callCountryCode || "IN").trim();
      if (effectiveCallPhone) {
        try {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Call - ${effectiveCallPhone} - ${Date.now()}`,
                callAsset: {
                  countryCode: effectiveCallCountry,
                  phoneNumber: effectiveCallPhone
                }
              }
            }]
          }, { headers });
          const assetRef = assetRes.data?.results?.[0]?.resourceName;
          if (assetRef) {
            createdAssetResources.push(assetRef);
            campaignAssetOperations.push({
              create: {
                campaign: apiResult.campaignResourceName,
                asset: assetRef,
                fieldType: "CALL",
                status: "ENABLED"
              }
            });
          }
        } catch (callErr: any) {
          console.warn("[SalesSearchService] Call asset creation skipped:", callErr?.response?.data || callErr?.message || callErr);
        }
      }

      // G. Promotions (PromotionAsset)
      const inputPromos = Array.isArray(promotions) ? promotions : [];
      for (const promo of inputPromos) {
        const target = (promo.promotionTarget || promo.item || "").trim();
        const promoUrl = (promo.finalUrl || promo.url || "").trim();
        if (target && promoUrl) {
          try {
            const promoBody: any = {
              promotionTarget: target,
              languageCode: promo.languageCode || "en"
            };
            if (promo.occasion && promo.occasion !== "None") {
              promoBody.occasion = promo.occasion;
            }
            if (promo.percentOff) {
              promoBody.percentOff = Math.round(Number(promo.percentOff) * 10000);
            } else if (promo.moneyAmountOff) {
              promoBody.moneyAmountOff = {
                currencyCode: promo.currencyCode || "INR",
                amountMicros: String(Math.round(Number(promo.moneyAmountOff) * 1_000_000))
              };
            }
            if (promo.promotionCode) {
              promoBody.promotionCode = String(promo.promotionCode).trim();
            }

            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [{
                create: {
                  name: `Promo - ${target.slice(0, 20)} - ${Date.now()}`,
                  promotionAsset: promoBody,
                  finalUrls: [promoUrl]
                }
              }]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: apiResult.campaignResourceName,
                  asset: assetRef,
                  fieldType: "PROMOTION",
                  status: "ENABLED"
                }
              });
            }
          } catch (pErr: any) {
            console.warn("[SalesSearchService] Promotion asset creation skipped:", pErr?.message || pErr);
          }
        }
      }

      // Link all created assets to the Search campaign via campaignAssets:mutate
      if (campaignAssetOperations.length > 0) {
        try {
          const caRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
            operations: campaignAssetOperations
          }, { headers });
          apiResult.campaignAssetResourceNames = (caRes.data?.results || []).map((r: any) => r.resourceName);
        } catch (caErr: any) {
          console.warn("[SalesSearchService] campaignAssets:mutate linking warning:", caErr?.message || caErr);
        }
      }

    } catch (apiErr: any) {
      if (createdCampaignResource) {
        try {
          console.warn(`[SalesSearchService] Rolling back / pausing created campaign ${createdCampaignResource} due to downstream step failure...`);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{
              update: {
                resourceName: createdCampaignResource,
                status: "REMOVED"
              },
              updateMask: "status"
            }]
          }, { headers });
          console.warn(`[SalesSearchService] Successfully cleaned up campaign ${createdCampaignResource}`);
        } catch (cleanupErr: any) {
          console.error(`[SalesSearchService] Rollback removal failed for ${createdCampaignResource}:`, cleanupErr?.message);
        }
      }
      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error in Sales Search Post-Campaign Flow]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Sales Search Post-Campaign API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `search-${Date.now()}`,
      name: campaignName,
      campaignType: "SEARCH",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
      budget: Number(effectiveDailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      finalUrl,
      headlines: validHeadlines,
      descriptions: validDescriptions,
      keywords: keywords || [],
      adSchedule: effectiveSchedule.length > 0 ? effectiveSchedule : null,
      languages: cleanLanguages,
      searchThemes: payload?.searchThemes || null,
      geoTargets: {
        locations,
        languages: cleanLanguages,
        objective: "Sales",
        customParameters: (Array.isArray(customParameters) && customParameters.length > 0) ? customParameters : undefined,
        callPhoneNumber: effectiveCallPhone || undefined
      },
      advertisingChannelType: "SEARCH",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Search Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      }
    };
  }
}