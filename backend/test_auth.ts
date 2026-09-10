import { GoogleAdsBaseService } from "./src/services/googleAds/shared/GoogleAdsBaseService";
import axios from "axios";

class TestService extends GoogleAdsBaseService {
  public static async testAuth(orgId: string, cid: string) {
    try {
      const { headers, customerId } = await this.getAdsHeaders(orgId, cid);
      console.log("Obtained headers successfully. Customer ID:", customerId);
      console.log("Headers keys:", Object.keys(headers));
      console.log("Developer token:", headers["developer-token"]);
      console.log("login-customer-id:", headers["login-customer-id"]);

      // Test GAQL query
      const query = "SELECT customer.id, customer.descriptive_name, customer.status FROM customer LIMIT 1";
      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${customerId}/googleAds:search`, { query }, { headers });
      console.log("Query success! Results:", JSON.stringify(res.data, null, 2));
    } catch (err: any) {
      console.error("Auth test failed:", err?.response?.data || err.message);
    }
  }
}

TestService.testAuth("81f4041e-1171-4472-8565-44ddc2b20bf1", "6587355041");
