export interface MetaSDKInitParams {
  appId: string;
  cookie?: boolean;
  xfbml?: boolean;
  version: string;
}

export interface MetaLoginResponse {
  authResponse?: {
    accessToken: string;
    expiresIn: number;
    signedRequest: string;
    userID: string;
    code?: string;
  };
  status: 'connected' | 'not_authorized' | 'unknown';
}

export interface MetaLoginOptions {
  scope?: string;
  config_id?: string;
  response_type?: string;
  override_default_response_type?: boolean;
  extras?: {
    feature?: string;
    version?: number;
    sessionInfoVersion?: number;
    setup?: {
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export interface WhatsAppPhoneNumber {
  id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
  code_verification_status?: string;
  is_primary?: boolean;
}

export interface WhatsAppEmbeddedSignupData {
  phone_number_id?: string;
  waba_id?: string;
  code?: string;
  current_step?: string;
  event?: 'FINISH' | 'CANCEL' | 'ERROR';
  session_info?: any;
}

export interface WhatsAppEmbeddedSignupMessageEvent {
  type: string;
  event: 'WA_EMBEDDED_SIGNUP';
  data: WhatsAppEmbeddedSignupData;
}

export interface WhatsAppTokenExchangeResponse {
  success: boolean;
  accessToken?: string;
  wabaId?: string;
  phoneNumberId?: string;
  phoneNumber?: string;
  verifiedName?: string;
  qualityRating?: string;
  codeVerificationStatus?: string;
  businessName?: string;
  phoneNumbers?: WhatsAppPhoneNumber[];
  registered?: boolean;
  subscribed?: boolean;
  error?: string;
  details?: any;
}

export interface InstagramAccountProfile {
  id: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  account_type?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  biography?: string;
  website?: string;
}

export interface InstagramConnectedAccount {
  id: string; // Facebook Page ID or IG ID
  name: string;
  access_token?: string;
  instagram_business_account?: InstagramAccountProfile;
  is_primary?: boolean;
}

export interface InstagramTokenExchangeResponse {
  success: boolean;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  profile?: InstagramAccountProfile;
  accounts?: InstagramConnectedAccount[];
  error?: string;
  details?: any;
}

declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (params: MetaSDKInitParams) => void;
      login: (
        callback: (response: MetaLoginResponse) => void,
        options?: MetaLoginOptions
      ) => void;
      getLoginStatus: (
        callback: (response: MetaLoginResponse) => void
      ) => void;
    };
  }
}

