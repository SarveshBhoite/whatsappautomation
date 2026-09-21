import sys
sys.stdout.reconfigure(encoding="utf-8")

with open(r"src/services/meta-ads/metaAIConversationService.ts", encoding="utf-8") as f:
    lines = f.readlines()

in_gen = False
current_branch = None

for idx, line in enumerate(lines[4785:]):
    line_num = 4786 + idx
    stripped = line.strip()
    if stripped.startswith("if (!") or stripped.startswith("} else if (!"):
        current_branch = stripped
        print(f"\n--- Line {line_num}: {current_branch} ---")
    if "nextQuestion =" in line:
        print(f"  Q: {line.strip()[:140]}")
    if "quickOptions =" in line:
        print(f"  Options: {line.strip()[:140]}")
