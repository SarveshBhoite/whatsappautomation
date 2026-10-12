import dotenv from "dotenv";
dotenv.config();

import axios from "axios";
import { getGoogleAccessToken } from "./services/gmbSyncService";
import prisma from "./utils/prisma";

async function testMC() {
  const orgId = "81f4041e-1171-4472-8565-44ddc2b20bf1";
  const merchantId = "5840531233";
  const config = await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId: orgId } });
  const token = await getGoogleAccessToken(process.env.GOOGLE_CLIENT_ID || "", process.env.GOOGLE_CLIENT_SECRET || "", config.googleRefreshToken);

  console.log("Acquired Google Token successfully.");

  // 1. Test productstatuses
  try {
    const res = await axios.get(`https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/productstatuses?maxResults=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Productstatuses count:", res.data?.resources?.length || 0);
    if (res.data?.resources?.length) {
      console.log("Sample status:", JSON.stringify(res.data.resources[0], null, 2));
    }
  } catch (e: any) {
    console.log("Productstatuses error:", e.response?.data || e.message);
  }

  // 2. Test products
  try {
    const res = await axios.get(`https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/products?maxResults=5`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Products count:", res.data?.resources?.length || 0);
    if (res.data?.resources?.length) {
      console.log("Sample product:", JSON.stringify(res.data.resources[0], null, 2));
    }
  } catch (e: any) {
    console.log("Products error:", e.response?.data || e.message);
  }
}

testMC().catch(console.error);
