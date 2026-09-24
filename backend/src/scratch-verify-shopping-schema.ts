import dotenv from "dotenv";
dotenv.config();

import { GoogleAdsService } from "./services/googleAdsService";
import axios from "axios";

async function verifyShoppingSchema() {
  const orgId = "81f4041e-1171-4472-8565-44ddc2b20bf1";
  const cid = "6587355041";
  const { headers } = await GoogleAdsService.getAdsHeaders(orgId, cid);
  console.log("Got headers successfully.");

  // 1. Check Shopping / PMax campaigns
  const qCamp = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign.shopping_setting.merchant_id,
      campaign.shopping_setting.feed_label
    FROM campaign
    WHERE campaign.advertising_channel_type IN ('SHOPPING', 'PERFORMANCE_MAX')
    LIMIT 10
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qCamp }, { headers });
    console.log("Campaigns found:", res.data?.results?.length || 0);
    if (res.data?.results?.length) {
      console.log(JSON.stringify(res.data.results, null, 2));
    }
  } catch (e: any) {
    console.error("Campaign query failed:", JSON.stringify(e.response?.data || e.message, null, 2));
  }

  // 2. Check ad_group_criterion (Shopping listing groups / product partitions)
  const qListing = `
    SELECT
      ad_group_criterion.resource_name,
      ad_group_criterion.criterion_id,
      ad_group_criterion.status,
      ad_group_criterion.listing_group.type,
      ad_group_criterion.listing_group.parent_ad_group_criterion,
      ad_group_criterion.listing_group.case_value.product_brand.value,
      ad_group_criterion.listing_group.case_value.product_item_id.value,
      ad_group_criterion.listing_group.case_value.product_type.value,
      ad_group_criterion.listing_group.case_value.product_type.level,
      ad_group_criterion.listing_group.case_value.product_custom_attribute.value,
      ad_group_criterion.listing_group.case_value.product_custom_attribute.index,
      ad_group_criterion.negative,
      campaign.id,
      campaign.name,
      ad_group.id,
      ad_group.name
    FROM ad_group_criterion
    WHERE ad_group_criterion.type = 'LISTING_GROUP'
    LIMIT 20
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qListing }, { headers });
    console.log("Shopping listing groups (ad_group_criterion):", res.data?.results?.length || 0);
  } catch (e: any) {
    console.error("Shopping listing groups query failed:", e.response?.data?.error?.message || e.message);
  }

  // 3. Check Performance Max retail listing group filters (asset_group_listing_group_filter)
  const qPmaxFilter = `
    SELECT
      asset_group_listing_group_filter.resource_name,
      asset_group_listing_group_filter.id,
      asset_group_listing_group_filter.asset_group,
      asset_group_listing_group_filter.type,
      asset_group_listing_group_filter.parent_listing_group_filter,
      asset_group_listing_group_filter.case_value.product_brand.value,
      asset_group_listing_group_filter.case_value.product_item_id.value,
      asset_group_listing_group_filter.case_value.product_type.value,
      asset_group_listing_group_filter.case_value.product_type.level,
      asset_group_listing_group_filter.case_value.product_custom_attribute.value,
      asset_group_listing_group_filter.case_value.product_custom_attribute.index
    FROM asset_group_listing_group_filter
    LIMIT 20
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qPmaxFilter }, { headers });
    console.log("PMax listing group filters (asset_group_listing_group_filter):", res.data?.results?.length || 0);
  } catch (e: any) {
    console.error("PMax listing group filters query failed:", e.response?.data?.error?.message || e.message);
  }

  // 4. Check shopping_performance_view
  const qShoppingPerf = `
    SELECT
      segments.product_item_id,
      segments.product_title,
      segments.product_merchant_id,
      segments.product_brand,
      segments.product_channel,
      segments.product_country,
      metrics.clicks,
      metrics.impressions,
      metrics.cost_micros
    FROM shopping_performance_view
    WHERE segments.date DURING LAST_30_DAYS
    LIMIT 5
  `;
  try {
    const res = await axios.post(`https://googleads.googleapis.com/v24/customers/${cid}/googleAds:search`, { query: qShoppingPerf }, { headers });
    console.log("shopping_performance_view:", res.data?.results?.length || 0);
  } catch (e: any) {
    console.error("shopping_performance_view failed:", e.response?.data?.error?.message || e.message);
  }
}

verifyShoppingSchema().catch(console.error);
