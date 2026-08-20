import dotenv from "dotenv";
import axios from "axios";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function listModels() {
  const apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
  console.log("Listing models for key:", apiKey ? apiKey.slice(0, 10) + "..." : "NONE");
  try {
    const res = await axios.get("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    console.log("AVAILABLE MODELS:", res.data.data.map((m: any) => m.id));
  } catch (err: any) {
    console.error("ERROR LISTING MODELS:", err?.response?.data || err.message);
  }
}

listModels();
