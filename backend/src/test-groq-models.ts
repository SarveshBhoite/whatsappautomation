import dotenv from "dotenv";
import axios from "axios";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testGroqModel(modelName: string) {
  const apiKey = process.env.GROQ_API_KEY;
  console.log(`\nTesting Model: ${modelName} | API Key Loaded: ${apiKey ? "YES (starts with " + apiKey.slice(0, 7) + ")" : "NO"}`);
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: modelName,
        messages: [{ role: "user", content: "Hello!" }]
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    );
    console.log(`✅ SUCCESS [${modelName}]:`, res.data.choices[0]?.message?.content?.trim());
    return true;
  } catch (err: any) {
    console.error(`❌ ERROR [${modelName}]:`, err?.response?.data || err.message);
    return false;
  }
}

async function main() {
  const models = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768"
  ];
  for (const m of models) {
    const ok = await testGroqModel(m);
    if (ok) break;
  }
}

main();
