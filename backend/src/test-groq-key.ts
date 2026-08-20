import dotenv from "dotenv";
import axios from "axios";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testKey() {
  const apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
  console.log("Testing Key:", apiKey ? apiKey.slice(0, 10) + "..." : "NONE");
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Hello! Reply in one short sentence." }]
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    );
    console.log("SUCCESS RESPONSE:", res.data.choices[0]?.message?.content);
  } catch (err: any) {
    console.error("ERROR RESPONSE:", err?.response?.data || err.message);
  }
}

testKey();
