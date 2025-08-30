export interface IZaloConfig {
  url: string;
  appId: string;
  appSecret: string;
  znsApiUrl: string;
  znsApiKey: string;
  znsSecretKey: string;
  znsTemplateId: string;
  appDeepLink: string;
  webhookApiKey: string;
}

export interface IZaloProfile {
  birthday: string;
  name: string;
  id: string;
  picture: {
    data: {
      url: string;
    };
  };
  error: number;
}

export interface IZaloPhoneNumber {
  data: {
    number: string;
  };
  error: number;
}
