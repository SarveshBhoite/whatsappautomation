import dotenv from "dotenv";
import axios from "axios";
import path from "path";

dotenv.config({ path: path.join(__dirname, "../.env") });

async function testModel(modelId: string) {
  const apiKey = process.env.GROQ_KEY || process.env.GROQ_API_KEY;
  console.log(`Testing model: ${modelId}`);
  try {
    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: modelId,
        messages: [{ role: "user", content: "Say hello in one short sentence." }]
      },
      {
        headers: { Authorization: `Bearer ${apiKey}` }
      }
    );
    console.log(`✅ SUCCESS [${modelId}]:`, res.data.choices[0]?.message?.content?.trim());
    return true;
  } catch (err: any) {
    console.error(`❌ FAILED [${modelId}]:`, err?.response?.data || err.message);
    return false;
  }
}

async function main() {
  const models = [
    "groq/compound",
    "openai/gpt-oss-20b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-120b",
    "groq/compound-mini"
  ];
  for (const m of models) {
    await testModel(m);
  }
}

main();
