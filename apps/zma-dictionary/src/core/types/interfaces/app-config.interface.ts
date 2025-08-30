export interface AppConfig {
  r2: {
    dictionaryImagesBucket: string;
    dictionaryAudiosBucket: string;
    region: string;
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    dictionaryImagesBaseUrl: string;
    dictionaryAudiosBaseUrl: string;
  };
  analyze: {
    speech: {
      url: string;
    };
  };
}
