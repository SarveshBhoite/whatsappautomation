import axios from "axios";

async function testDemographicsApi() {
  const orgId = "81f4041e-1171-4472-8565-44ddc2b20bf1";
  const cid = "6587355041";
  const campaignId = "24168330447";

  console.log("=== 1. Testing GET /api/ads/demographics ===");
  try {
    const res = await axios.get(
      `http://127.0.0.1:5000/api/ads/demographics?orgId=${orgId}&customerId=${cid}&campaignId=${campaignId}`
    );
    console.log("GET demographics status:", res.status);
    console.log("Response campaign:", res.data?.demographics?.campaignName, "(", res.data?.demographics?.campaignType, ")");
    console.log("Support notes:", res.data?.demographics?.supportNotes);
    console.log("Age ranges count:", res.data?.demographics?.dimensions?.ageRanges?.availableValues?.length);
  } catch (err: any) {
    console.error("GET demographics failed:", err.response ? err.response.data : err.message);
  }

  console.log("=== 2. Testing Customer Ownership Isolation (Unauthorized Customer) ===");
  try {
    await axios.get(
      `http://127.0.0.1:5000/api/ads/demographics?orgId=${orgId}&customerId=9999999999&campaignId=${campaignId}`
    );
    console.error("FAIL: Unauthorized customer did NOT return 403!");
  } catch (err: any) {
    console.log("PASS: Unauthorized customer returned status:", err.response?.status, err.response?.data);
  }

  console.log("=== 3. Testing POST /api/ads/demographics & DELETE ===");
  let createdResource = "";
  try {
    const postRes = await axios.post(
      "http://127.0.0.1:5000/api/ads/demographics",
      {
        orgId,
        customerId: cid,
        campaignId,
        dimension: "AGE_RANGE",
        typeValue: "AGE_RANGE_65_UP",
        negative: true
      }
    );
    console.log("POST status:", postRes.status, "Created:", postRes.data?.resourceName);
    createdResource = postRes.data?.resourceName;
  } catch (err: any) {
    console.error("POST failed:", err.response ? err.response.data : err.message);
  }

  if (createdResource) {
    console.log("=== 4. Cleaning up with DELETE ===");
    try {
      const delRes = await axios.delete(
        `http://127.0.0.1:5000/api/ads/demographics?orgId=${orgId}&customerId=${cid}&resourceName=${encodeURIComponent(createdResource)}`
      );
      console.log("DELETE status:", delRes.status, delRes.data);
    } catch (err: any) {
      console.error("DELETE failed:", err.response ? err.response.data : err.message);
    }
  }

  console.log("=== 5. Testing PMax campaign ===");
  try {
    const pmaxRes = await axios.get(
      `http://127.0.0.1:5000/api/ads/demographics?orgId=${orgId}&customerId=${cid}&campaignId=23261518289`
    );
    console.log("PMax GET status:", pmaxRes.status);
    console.log("PMax isPMax:", pmaxRes.data?.demographics?.isPMax);
    console.log("PMax supportNotes:", pmaxRes.data?.demographics?.supportNotes);
  } catch (err: any) {
    console.error("PMax GET failed:", err.response ? err.response.data : err.message);
  }
}

testDemographicsApi().catch(console.error);
