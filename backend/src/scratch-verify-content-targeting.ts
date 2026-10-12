import axios from "axios";

async function testContentTargetingApi() {
  const orgId = "81f4041e-1171-4472-8565-44ddc2b20bf1";
  const cid = "6587355041";
  const searchCampId = "24168330447";
  const displayCampId = "24171065652";

  console.log("=== 1. Testing GET /api/ads/content-targeting (Search Campaign) ===");
  try {
    const res = await axios.get(
      `http://127.0.0.1:5000/api/ads/content-targeting?orgId=${orgId}&customerId=${cid}&campaignId=${searchCampId}`
    );
    console.log("GET Search status:", res.status);
    console.log("Search campaign:", res.data?.contentTargeting?.campaignName, "(", res.data?.contentTargeting?.campaignType, ")");
    console.log("Search supportNotes:", res.data?.contentTargeting?.supportNotes);
  } catch (err: any) {
    console.error("GET Search failed:", err.response ? err.response.data : err.message);
  }

  console.log("=== 2. Testing Customer Ownership Isolation (Unauthorized Customer) ===");
  try {
    await axios.get(
      `http://127.0.0.1:5000/api/ads/content-targeting?orgId=${orgId}&customerId=9999999999&campaignId=${searchCampId}`
    );
    console.error("FAIL: Unauthorized customer did NOT return 403!");
  } catch (err: any) {
    console.log("PASS: Unauthorized customer returned status:", err.response?.status, err.response?.data);
  }

  console.log("=== 3. Testing POST & DELETE Placement Exclusion ===");
  let createdPlacementResource = "";
  try {
    const postRes = await axios.post(
      "http://127.0.0.1:5000/api/ads/content-targeting/placement",
      {
        orgId,
        customerId: cid,
        campaignId: searchCampId,
        url: "test-exclude-domain.com",
        negative: true
      }
    );
    console.log("POST Placement status:", postRes.status, "Created:", postRes.data?.resourceName);
    createdPlacementResource = postRes.data?.resourceName;
  } catch (err: any) {
    console.error("POST Placement failed:", err.response ? err.response.data : err.message);
  }

  if (createdPlacementResource) {
    console.log("=== 4. Cleaning up Placement Exclusion with DELETE ===");
    try {
      const delRes = await axios.delete(
        `http://127.0.0.1:5000/api/ads/content-targeting?orgId=${orgId}&customerId=${cid}&resourceName=${encodeURIComponent(createdPlacementResource)}`
      );
      console.log("DELETE Placement status:", delRes.status, delRes.data);
    } catch (err: any) {
      console.error("DELETE Placement failed:", err.response ? err.response.data : err.message);
    }
  }

  console.log("=== 5. Testing POST & DELETE Topic Exclusion on Display Campaign ===");
  let createdTopicResource = "";
  try {
    const postTopic = await axios.post(
      "http://127.0.0.1:5000/api/ads/content-targeting/topic",
      {
        orgId,
        customerId: cid,
        campaignId: displayCampId,
        topicConstantOrId: "topicConstants/11", // Home & Garden
        negative: true
      }
    );
    console.log("POST Topic status:", postTopic.status, "Created:", postTopic.data?.resourceName);
    createdTopicResource = postTopic.data?.resourceName;
  } catch (err: any) {
    console.error("POST Topic failed:", err.response ? err.response.data : err.message);
  }

  if (createdTopicResource) {
    console.log("=== 6. Cleaning up Topic Exclusion with DELETE ===");
    try {
      const delRes = await axios.delete(
        `http://127.0.0.1:5000/api/ads/content-targeting?orgId=${orgId}&customerId=${cid}&resourceName=${encodeURIComponent(createdTopicResource)}`
      );
      console.log("DELETE Topic status:", delRes.status, delRes.data);
    } catch (err: any) {
      console.error("DELETE Topic failed:", err.response ? err.response.data : err.message);
    }
  }

  console.log("=== 7. Testing PMax Campaign Restriction ===");
  try {
    const pmaxRes = await axios.get(
      `http://127.0.0.1:5000/api/ads/content-targeting?orgId=${orgId}&customerId=${cid}&campaignId=23261518289`
    );
    console.log("PMax GET status:", pmaxRes.status);
    console.log("PMax isPMax:", pmaxRes.data?.contentTargeting?.isPMax);
    console.log("PMax supportNotes:", pmaxRes.data?.contentTargeting?.supportNotes);
  } catch (err: any) {
    console.error("PMax GET failed:", err.response ? err.response.data : err.message);
  }
}

testContentTargetingApi().catch(console.error);
