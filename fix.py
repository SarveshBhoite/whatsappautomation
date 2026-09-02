import re

with open(r'frontend\src\app\linkedin\page.tsx', 'r') as f:
    content = f.read()

# Fix imports
content = re.sub(r'import \{ ([^}]+) \} from "@/components/([^/]+)";',
                 lambda m: f'import {{ {m.group(1)} }} from "@/components/linkedIns/{m.group(2)}";' if m.group(1).strip() in ['LinkedInProfileCard', 'LinkedInProfileDashboard', 'PostComposer', 'RecentPosts', 'ScheduleQueue', 'DraftLibrary', 'CompanyPageCard', 'LinkedInAnalyticsDashboard', 'ApprovalWorkflowQueue', 'ContentCalendar', 'MediaLibrary', 'EnterpriseReports', 'AIAssistantModal', 'EngagementDashboard'] else m.group(0),
                 content)

# Fix implicit any types
content = content.replace('onPostPublished={(newPost) => {', 'onPostPublished={(newPost: any) => {')
content = content.replace('onEditDraft={(draft) => {', 'onEditDraft={(draft: any) => {')
content = content.replace('onDeletePost={async (postId) => {', 'onDeletePost={async (postId: any) => {')
content = content.replace('onApplyContent={(text) => {', 'onApplyContent={(text: string) => {')

# Personal requests should use crm1
def replace_org_id_in_func(func_name, content_str):
    pattern = r'(const ' + func_name + r' = .*?\{[\s\S]*?)const orgId = getActiveOrgId\(\);'
    return re.sub(pattern, r'\g<1>const orgId = "crm1";', content_str, count=1)

content = replace_org_id_in_func('fetchConfig', content)
content = replace_org_id_in_func('fetchProfile', content)
content = replace_org_id_in_func('fetchPosts', content)
content = replace_org_id_in_func('fetchDrafts', content)
content = replace_org_id_in_func('fetchScheduled', content)
content = replace_org_id_in_func('handleConnectOAuth', content)
content = replace_org_id_in_func('handleSyncNow', content)
content = replace_org_id_in_func('handleDisconnect', content)

# fetchContentIdeas - change getActiveOrgId to (activeTab === 'profile' ? 'crm1' : getActiveOrgId())
content = re.sub(r'(const fetchContentIdeas = .*?\{[\s\S]*?)const orgId = getActiveOrgId\(\);', r'\g<1>const orgId = activeTab === "profile" ? "crm1" : getActiveOrgId();', content, count=1)

# useEffect activeTab
effect_target = '''  useEffect(() => {
    if (activeTab === "company") {
      fetchOrgConfig();
    } else if (activeTab === "profile") {
      fetchConfig();
      fetchProfile();
      fetchPosts();
    }
  }, [activeTab]);'''

effect_replacement = '''  useEffect(() => {
    if (activeTab === "company") {
      setActiveOrgId(getActiveOrgId());
      fetchOrgConfig();
    } else if (activeTab === "profile") {
      setActiveOrgId("crm1");
      fetchConfig();
      fetchProfile();
      fetchPosts();
    }
  }, [activeTab]);'''

content = content.replace(effect_target, effect_replacement)

with open(r'frontend\src\app\linkedin\page.tsx', 'w') as f:
    f.write(content)

print('Success')
