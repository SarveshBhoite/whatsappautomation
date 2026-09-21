with open(r"src/services/meta-ads/metaAIConversationService.ts", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "static async generateDeterministicNextStep" in line:
        print(f"generateDeterministicNextStep found at line: {idx+1}")
        for j in range(idx, min(idx + 120, len(lines))):
            print(f"{j+1}: {lines[j]}", end="")
        break
