import os

src = r"frontend\src\app\ads\campaigns\create\display\page.tsx"
dst = r"frontend\src\app\ads\campaigns\create\no-guidance\display\page.tsx"

with open(src, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("export default function DisplayCampaignCreatePage() {", "export default function NoGuidanceDisplayPage() {")

with open(dst, 'w', encoding='utf-8') as f:
    f.write(content)
