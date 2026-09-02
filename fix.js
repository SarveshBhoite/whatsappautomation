const fs = require('fs');
const path = 'frontend/src/app/linkedin/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Fix imports
const componentsToReplace = [
  'LinkedInProfileCard', 'LinkedInProfileDashboard', 'PostComposer', 'RecentPosts',
  'ScheduleQueue', 'DraftLibrary', 'CompanyPageCard', 'LinkedInAnalyticsDashboard',
  'ApprovalWorkflowQueue', 'ContentCalendar', 'MediaLibrary', 'EnterpriseReports',
  'AIAssistantModal', 'EngagementDashboard'
];

content = content.replace(/import \{ ([^}]+) \} from "@\/components\/([^/]+)";/g, (match, p1, p2) => {
  if (componentsToReplace.includes(p1.trim())) {
    return `import { ${p1} } from "@/components/linkedIns/${p2}";`;
  }
  return match;
});

// Fix implicit any types
content = content.replace('onPostPublished={(newPost) => {', 'onPostPublished={(newPost: any) => {');
content = content.replace('onEditDraft={(draft) => {', 'onEditDraft={(draft: any) => {');
content = content.replace('onDeletePost={async (postId) => {', 'onDeletePost={async (postId: any) => {');
content = content.replace('onApplyContent={(text) => {', 'onApplyContent={(text: string) => {');

// Personal requests should use crm1
const replaceOrgId = (funcName, contentStr) => {
  const regex = new RegExp(`(const ${funcName} = .*?\\{[\\s\\S]*?)const orgId = getActiveOrgId\\(\\);`);
  return contentStr.replace(regex, `$1const orgId = "crm1";`);
};

content = replaceOrgId('fetchConfig', content);
content = replaceOrgId('fetchProfile', content);
content = replaceOrgId('fetchPosts', content);
content = replaceOrgId('fetchDrafts', content);
content = replaceOrgId('fetchScheduled', content);
content = replaceOrgId('handleConnectOAuth', content);
content = replaceOrgId('handleSyncNow', content);
content = replaceOrgId('handleDisconnect', content);

// fetchContentIdeas
content = content.replace(
  /(const fetchContentIdeas = .*?\{[\s\S]*?)const orgId = getActiveOrgId\(\);/,
  '$1const orgId = activeTab === "profile" ? "crm1" : getActiveOrgId();'
);

// useEffect activeTab
const effectTarget = `  useEffect(() => {
    if (activeTab === "company") {
      fetchOrgConfig();
    } else if (activeTab === "profile") {
      fetchConfig();
      fetchProfile();
      fetchPosts();
    }
  }, [activeTab]);`;

const effectReplacement = `  useEffect(() => {
    if (activeTab === "company") {
      setActiveOrgId(getActiveOrgId());
      fetchOrgConfig();
    } else if (activeTab === "profile") {
      setActiveOrgId("crm1");
      fetchConfig();
      fetchProfile();
      fetchPosts();
    }
  }, [activeTab]);`;

content = content.replace(effectTarget, effectReplacement);

fs.writeFileSync(path, content);
console.log('Success');
