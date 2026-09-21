import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

with open(r"src/services/meta-ads/metaAIConversationService.ts", encoding="utf-8") as f:
    text = f.read()

gen_idx = text.find("static async generateDeterministicNextStep(")
end_idx = text.find("state.conversation.push(", gen_idx)
gen_code = text[gen_idx:end_idx + 500]

matches = list(re.finditer(r"(?:if|else if)\s*\((!has[a-zA-Z0-9_|&\s!]+)\)\s*\{", gen_code))
print(f"Total question branches: {len(matches)}")
for m in matches:
    branch_name = m.group(1).strip()
    branch_start = m.start()
    next_b = gen_code.find("} else", branch_start + 10)
    if next_b == -1:
        next_b = branch_start + 3000
    branch_body = gen_code[branch_start:next_b]
    has_opts = "quickOptions" in branch_body
    print(f"- {branch_name:45} | Has quickOptions: {has_opts}")
