$src = "frontend\src\app\ads\campaigns\create\display\page.tsx"
$dst = "frontend\src\app\ads\campaigns\create\no-guidance\display\page.tsx"

$content = Get-Content -Path $src -Raw -Encoding UTF8

$content = $content -replace "export default function DisplayCampaignCreatePage\(\) \{", "export default function NoGuidanceDisplayPage() {"
$content = $content -replace 'defaultValue="Sales-Display-3"', 'defaultValue="NoGuidance-Display-1"'
$content = $content -replace '<span className="font-semibold text-slate-200">Sales</span>', '<span className="font-semibold text-slate-200">No goal guidance</span>'

Set-Content -Path $dst -Value $content -Encoding UTF8
Write-Host "Migration complete! Please check the no-guidance display page."
