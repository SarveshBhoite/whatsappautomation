
const http = require("http");
const payload = {
  orgId: "DEFAULT_ORG",
  customerId: "6587355041",
  campaignName: "Test Video",
  channelType: "VIDEO",
  biddingStrategy: "TARGET_CPA",
  budget: 10,
  targetCpa: 2,
  startDate: "2026-08-28",
  endDate: "2099-12-31",
  finalUrl: "https://example.com",
  businessName: "Test",
  headlines: ["Test headline 1"],
  descriptions: ["Test desc 1"],
  images: [],
  logos: []
};
const req = http.request({
  hostname: "localhost",
  port: 3000,
  path: "/api/ads/campaign/launch",
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  }
}, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => console.log("Response:", res.statusCode, data));
});
req.on("error", (e) => console.error(e));
req.write(JSON.stringify(payload));
req.end();
