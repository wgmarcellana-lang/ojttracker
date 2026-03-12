import { NativeModules } from 'react-native';

const FALLBACK_API_BASE_URL = 'http://192.168.18.149:3000';

const getDevServerHost = () => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;

  if (!scriptURL) {
    return null;
  }

  try {
    return new URL(scriptURL).hostname;
  } catch (error) {
    return null;
  }
};

const devServerHost = getDevServerHost();

export const API_BASE_URL =
  __DEV__ && devServerHost
    ? `http://${devServerHost}:3000`
    : FALLBACK_API_BASE_URL;
