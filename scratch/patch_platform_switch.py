import sys

filepath = r"c:\Users\ADMIN\whatsappautomation\frontend\src\app\ads\page.tsx"

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add platform state inside GoogleAdsPage
old_state_anchor = "  const [isConnected, setIsConnected] = useState(false);"
new_state_anchor = "  const [platform, setPlatform] = useState<\"google\" | \"meta\">(\"google\");\n  const [isConnected, setIsConnected] = useState(false);"

content = content.replace(old_state_anchor, new_state_anchor, 1)

# 2. Add platform return check right after configLoading check inside GoogleAdsPage
old_return_anchor = """  if (!isConnected) {"""

new_return_anchor = """  if (platform === "meta") {
    return (
      <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-hidden">
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm leading-none">Meta Ads Platform</h1>
              <p className="text-xs text-slate-500 mt-0.5">Facebook & Instagram Ad Campaigns</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setPlatform("google")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-200 transition-all"
            >
              <Megaphone className="h-3.5 w-3.5" />
              Google Ads
            </button>
            <button
              onClick={() => setPlatform("meta")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white shadow shadow-blue-500/30 transition-all"
            >
              <Globe className="h-3.5 w-3.5" />
              Meta Ads (FB/IG)
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          <MetaAdsWorkspace orgId={orgId} showToast={(msg: string) => setToast(msg)} />
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl bg-slate-800 border border-slate-600/50 text-slate-100 text-sm shadow-2xl backdrop-blur">
            {toast}
          </div>
        )}
      </div>
    );
  }

  if (!isConnected) {"""

content = content.replace(old_return_anchor, new_return_anchor, 1)

# 3. Add platform switcher control inside Google Ads header
old_header_anchor = """        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
            <Megaphone className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-sm leading-none">Google Ads</h1>
            <p className="text-xs text-slate-500 mt-0.5">Complete Ads Platform</p>
          </div>
        </div>"""

new_header_anchor = """        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
              <Megaphone className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-sm leading-none">Google Ads</h1>
              <p className="text-xs text-slate-500 mt-0.5">Complete Ads Platform</p>
            </div>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              onClick={() => setPlatform("google")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                platform === "google"
                  ? "bg-primary text-slate-950 shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Megaphone className="h-3.5 w-3.5" />
              Google Ads
            </button>
            <button
              onClick={() => setPlatform("meta")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                platform === "meta"
                  ? "bg-blue-600 text-white shadow shadow-blue-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              Meta Ads (FB/IG)
            </button>
          </div>
        </div>"""

content = content.replace(old_header_anchor, new_header_anchor, 1)

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Platform switcher patch applied successfully!")
