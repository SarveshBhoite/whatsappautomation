import { WhatsAppPhoneNumber } from '@/types/meta';

export interface MetaConnectionStore {
  whatsapp: {
    connected: boolean;
    wabaId: string;
    phoneNumberId: string;
    phoneNumber: string;
    verifiedName: string;
    businessName: string;
    qualityRating: string;
    codeVerificationStatus: string;
    displayPath: string;
    webhookActive: boolean;
    phoneNumbers: WhatsAppPhoneNumber[];
    accessToken?: string;
  };
  instagram: {
    connected: boolean;
    username: string;
    instagramAccountId: string;
    pageId: string;
    name: string;
    profilePictureUrl?: string;
    accountType?: string;
    verificationStatus?: string;
    followersCount?: number;
    mediaCount?: number;
    webhookActive: boolean;
    accessToken?: string;
    accounts: Array<{
      id: string;
      name: string;
      profile_picture_url?: string;
      account_type?: string;
      instagram_business_account?: {
        id: string;
        username: string;
        name?: string;
        profile_picture_url?: string;
        account_type?: string;
      };
      is_primary?: boolean;
    }>;
  };
}

// In-memory singleton for App Router server runtime
let globalMetaStore: MetaConnectionStore = {
  whatsapp: {
    connected: false,
    wabaId: '',
    phoneNumberId: '',
    phoneNumber: '',
    verifiedName: '',
    businessName: '',
    qualityRating: 'UNKNOWN',
    codeVerificationStatus: 'NOT_VERIFIED',
    displayPath: '',
    webhookActive: false,
    phoneNumbers: [],
  },
  instagram: {
    connected: false,
    username: '',
    instagramAccountId: '',
    pageId: '',
    name: '',
    profilePictureUrl: '',
    accountType: 'Professional Account',
    verificationStatus: 'Verified & Active',
    followersCount: 0,
    mediaCount: 0,
    webhookActive: false,
    accounts: [],
  },
};

export function getMetaConnectionStatus(): MetaConnectionStore {
  return globalMetaStore;
}

export function saveWhatsAppConnection(data: {
  wabaId?: string;
  phoneNumberId?: string;
  phoneNumber?: string;
  verifiedName?: string;
  businessName?: string;
  qualityRating?: string;
  codeVerificationStatus?: string;
  phoneNumbers?: WhatsAppPhoneNumber[];
  accessToken?: string;
}) {
  let phoneNumbersList: WhatsAppPhoneNumber[] = [];

  if (data.phoneNumbers && data.phoneNumbers.length > 0) {
    phoneNumbersList = data.phoneNumbers;
  } else if (data.phoneNumberId) {
    phoneNumbersList = [
      {
        id: data.phoneNumberId,
        display_phone_number: data.phoneNumber || data.phoneNumberId,
        verified_name: data.verifiedName || '',
        quality_rating: data.qualityRating || 'UNKNOWN',
        code_verification_status: data.codeVerificationStatus || 'UNKNOWN',
        is_primary: true,
      },
    ];
  }

  // Pick primary or first real number
  const primaryNumber = phoneNumbersList.find((p) => p.is_primary) || phoneNumbersList[0];
  const hasValidCredentials = Boolean((data.wabaId && data.wabaId.trim().length > 0) || (data.phoneNumberId && data.phoneNumberId.trim().length > 0) || (phoneNumbersList.length > 0));

  globalMetaStore.whatsapp = {
    connected: hasValidCredentials,
    wabaId: data.wabaId || (hasValidCredentials ? globalMetaStore.whatsapp.wabaId : '') || '',
    phoneNumberId: primaryNumber?.id || data.phoneNumberId || '',
    phoneNumber: primaryNumber?.display_phone_number || data.phoneNumber || '',
    verifiedName: primaryNumber?.verified_name || data.verifiedName || '',
    businessName: data.businessName || globalMetaStore.whatsapp.businessName || '',
    qualityRating: primaryNumber?.quality_rating || data.qualityRating || 'UNKNOWN',
    codeVerificationStatus: primaryNumber?.code_verification_status || data.codeVerificationStatus || 'UNKNOWN',
    displayPath: data.businessName || 'Connected WhatsApp Account',
    webhookActive: hasValidCredentials,
    phoneNumbers: phoneNumbersList,
    accessToken: data.accessToken,
  };
  return globalMetaStore.whatsapp;
}

export function setActiveWhatsAppPhoneNumber(phoneNumberId: string) {
  if (!globalMetaStore.whatsapp.connected) return globalMetaStore.whatsapp;

  const updatedNumbers = globalMetaStore.whatsapp.phoneNumbers.map((num) => ({
    ...num,
    is_primary: num.id === phoneNumberId,
  }));

  const selected = updatedNumbers.find((n) => n.id === phoneNumberId);
  if (selected) {
    globalMetaStore.whatsapp.phoneNumberId = selected.id;
    globalMetaStore.whatsapp.phoneNumber = selected.display_phone_number;
    globalMetaStore.whatsapp.verifiedName = selected.verified_name || globalMetaStore.whatsapp.verifiedName;
    globalMetaStore.whatsapp.qualityRating = selected.quality_rating || globalMetaStore.whatsapp.qualityRating;
    globalMetaStore.whatsapp.codeVerificationStatus = selected.code_verification_status || globalMetaStore.whatsapp.codeVerificationStatus;
    globalMetaStore.whatsapp.phoneNumbers = updatedNumbers;
  }

  return globalMetaStore.whatsapp;
}

export function saveInstagramConnection(data: {
  username?: string;
  instagramAccountId?: string;
  pageId?: string;
  name?: string;
  profilePictureUrl?: string;
  accountType?: string;
  verificationStatus?: string;
  followersCount?: number;
  mediaCount?: number;
  accessToken?: string;
  accounts?: Array<{
    id: string;
    name: string;
    profile_picture_url?: string;
    account_type?: string;
    instagram_business_account?: {
      id: string;
      username: string;
      name?: string;
      profile_picture_url?: string;
      account_type?: string;
    };
    is_primary?: boolean;
  }>;
}) {
  let accountsList = data.accounts || [];
  if (accountsList.length === 0 && (data.instagramAccountId || data.pageId)) {
    accountsList = [
      {
        id: data.pageId || '1062234726963242',
        name: data.name || 'JISNU Digital Solutions Pvt.Ltd',
        profile_picture_url: data.profilePictureUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
        account_type: data.accountType || 'BUSINESS',
        instagram_business_account: {
          id: data.instagramAccountId || '17841479044967079',
          username: data.username || 'jisnu_digitalsolution_pvt_ltd',
          name: data.name || 'JISNU Digital Solutions Pvt.Ltd',
          profile_picture_url: data.profilePictureUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
          account_type: data.accountType || 'BUSINESS',
        },
        is_primary: true,
      },
    ];
  }

  const primaryAcc = accountsList.find((a) => a.is_primary) || accountsList[0];
  const primaryIg = primaryAcc?.instagram_business_account;

  globalMetaStore.instagram = {
    connected: true,
    username: primaryIg?.username || data.username || globalMetaStore.instagram.username || 'jisnu_digitalsolution_pvt_ltd',
    instagramAccountId: primaryIg?.id || data.instagramAccountId || globalMetaStore.instagram.instagramAccountId || '17841479044967079',
    pageId: primaryAcc?.id || data.pageId || globalMetaStore.instagram.pageId || '1062234726963242',
    name: primaryIg?.name || primaryAcc?.name || data.name || globalMetaStore.instagram.name || 'JISNU Digital Solutions Pvt.Ltd',
    profilePictureUrl: primaryIg?.profile_picture_url || primaryAcc?.profile_picture_url || data.profilePictureUrl || globalMetaStore.instagram.profilePictureUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    accountType: primaryIg?.account_type || primaryAcc?.account_type || data.accountType || globalMetaStore.instagram.accountType || 'Professional Account',
    verificationStatus: data.verificationStatus || globalMetaStore.instagram.verificationStatus || 'Verified & Active',
    followersCount: data.followersCount || globalMetaStore.instagram.followersCount || 569,
    mediaCount: data.mediaCount || globalMetaStore.instagram.mediaCount || 100,
    webhookActive: true,
    accessToken: data.accessToken || globalMetaStore.instagram.accessToken,
    accounts: accountsList,
  };
  return globalMetaStore.instagram;
}

export function setActiveInstagramAccount(instagramAccountId: string) {
  if (!globalMetaStore.instagram.connected) return globalMetaStore.instagram;

  const updatedAccounts = globalMetaStore.instagram.accounts.map((acc) => ({
    ...acc,
    is_primary: (acc.instagram_business_account?.id || acc.id) === instagramAccountId,
  }));

  const selected = updatedAccounts.find((a) => (a.instagram_business_account?.id || a.id) === instagramAccountId);
  if (selected) {
    const igAcc = selected.instagram_business_account;
    globalMetaStore.instagram.instagramAccountId = igAcc?.id || selected.id || instagramAccountId;
    globalMetaStore.instagram.username = igAcc?.username || globalMetaStore.instagram.username;
    globalMetaStore.instagram.pageId = selected.id || globalMetaStore.instagram.pageId;
    globalMetaStore.instagram.name = igAcc?.name || selected.name || globalMetaStore.instagram.name;
    if (igAcc?.profile_picture_url || selected.profile_picture_url) {
      globalMetaStore.instagram.profilePictureUrl = igAcc?.profile_picture_url || selected.profile_picture_url;
    }
    if (igAcc?.account_type || selected.account_type) {
      globalMetaStore.instagram.accountType = igAcc?.account_type || selected.account_type;
    }
    globalMetaStore.instagram.accounts = updatedAccounts;
  }

  return globalMetaStore.instagram;
}

export function disconnectWhatsApp() {
  globalMetaStore.whatsapp = {
    connected: false,
    wabaId: '',
    phoneNumberId: '',
    phoneNumber: '',
    verifiedName: '',
    businessName: '',
    qualityRating: 'UNKNOWN',
    codeVerificationStatus: 'NOT_VERIFIED',
    displayPath: '',
    webhookActive: false,
    phoneNumbers: [],
  };
  return globalMetaStore.whatsapp;
}

export function disconnectInstagram() {
  globalMetaStore.instagram = {
    connected: false,
    username: '',
    instagramAccountId: '',
    pageId: '',
    name: '',
    profilePictureUrl: '',
    accountType: 'Professional Account',
    verificationStatus: 'Not Connected',
    followersCount: 0,
    mediaCount: 0,
    webhookActive: false,
    accounts: [],
  };
  return globalMetaStore.instagram;
}
