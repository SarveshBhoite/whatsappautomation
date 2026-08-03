import { getFeatureFlags } from "../config/featureFlags";

export interface ICompanyPostsAdapter {
  getCompanyFeed(organizationId: string): Promise<{ enabled: boolean; posts: any[]; status: string }>;
  publishCompanyPost(organizationId: string, postData: any): Promise<{ success: boolean; message: string }>;
}

export interface ICommentsAdapter {
  getComments(organizationId: string, postUrn: string): Promise<{ enabled: boolean; comments: any[] }>;
  replyComment(organizationId: string, commentUrn: string, text: string): Promise<{ success: boolean }>;
}

export interface IFollowerAnalyticsAdapter {
  getFollowerStats(organizationId: string): Promise<{ enabled: boolean; growthTrend: any[]; topCountries: any[] }>;
}

export class PartnerApiAdapter implements ICompanyPostsAdapter, ICommentsAdapter, IFollowerAnalyticsAdapter {
  private flags = getFeatureFlags();

  public async getCompanyFeed(organizationId: string) {
    if (!this.flags.communityManagementEnabled) {
      return {
        enabled: false,
        status: "Pending LinkedIn Partner Approval",
        posts: []
      };
    }
    return { enabled: true, status: "Active", posts: [] };
  }

  public async publishCompanyPost(organizationId: string, postData: any) {
    if (!this.flags.communityManagementEnabled) {
      return {
        success: false,
        message: "Community Management API is awaiting LinkedIn Partner Approval."
      };
    }
    return { success: true, message: "Published to Company Page" };
  }

  public async getComments(organizationId: string, postUrn: string) {
    if (!this.flags.commentsEnabled) {
      return { enabled: false, comments: [] };
    }
    return { enabled: true, comments: [] };
  }

  public async replyComment(organizationId: string, commentUrn: string, text: string) {
    if (!this.flags.commentsEnabled) {
      return { success: false };
    }
    return { success: true };
  }

  public async getFollowerStats(organizationId: string) {
    if (!this.flags.followerAnalyticsEnabled) {
      return {
        enabled: false,
        growthTrend: [
          { month: "May", followers: 1200 },
          { month: "Jun", followers: 1450 },
          { month: "Jul", followers: 1890 }
        ],
        topCountries: [
          { country: "United States", percentage: 42 },
          { country: "India", percentage: 28 },
          { country: "United Kingdom", percentage: 14 }
        ]
      };
    }
    return { enabled: true, growthTrend: [], topCountries: [] };
  }
}
