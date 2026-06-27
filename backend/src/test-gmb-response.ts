import axios from "axios";

async function test() {
  try {
    const url = "http://localhost:5000/api/gmb/performance?orgId=demo-org-123";
    console.log(`Querying backend: ${url}`);
    const response = await axios.get(url);
    console.log("Response Keys:", Object.keys(response.data));
    console.log("Range Object:", response.data.range);
    console.log("Summary Object:", response.data.summary);
    console.log("PreviousSummary Object:", response.data.previousSummary);
    console.log("Growth Object:", response.data.growth);
  } catch (error: any) {
    console.error("Backend request failed:", error.message);
  }
}

test();
