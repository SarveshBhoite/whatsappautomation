export interface FeatureFlags {
  communityManagementEnabled: boolean;
  analyticsEnabled: boolean;
  commentsEnabled: boolean;
  organizationEnabled: boolean;
  followerAnalyticsEnabled: boolean;
  aiAssistantEnabled: boolean;
  multiWorkspaceEnabled: boolean;
  campaignsEnabled: boolean;
}

export const getFeatureFlags = (): FeatureFlags => {
  return {
    communityManagementEnabled: process.env.LINKEDIN_COMMUNITY_MANAGEMENT_ENABLED === "true",
    analyticsEnabled: process.env.LINKEDIN_ANALYTICS_ENABLED === "true",
    commentsEnabled: process.env.LINKEDIN_COMMENTS_ENABLED === "true",
    organizationEnabled: process.env.LINKEDIN_ORGANIZATION_ENABLED === "true",
    followerAnalyticsEnabled: process.env.LINKEDIN_FOLLOWER_ANALYTICS_ENABLED === "true",
    aiAssistantEnabled: true,
    multiWorkspaceEnabled: true,
    campaignsEnabled: true
  };
};
