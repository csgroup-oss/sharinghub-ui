import config from '@/config';

export const BASE_URL  = window.location.origin.concat('/');
export const API_URL = config.apiUrl != null ? config.apiUrl: BASE_URL.concat('api/');
export const DOCS_URL = config.docsUrl != null ? config.docsUrl : BASE_URL.concat('ui/docs/');

export const MLFLOW_URL = config.mlflowUrl != null ? config.mlflowUrl : null;


export const STAC_ROOT_URL = API_URL.concat('stac/');
export const STAC_SEARCH = API_URL.concat('stac/search');
export const LOGIN_URL = API_URL.concat('auth/login?redirect_uri='.concat(window.location.origin));
export const LOGOUT_URL = API_URL.concat('auth/logout');
export const USER_INFO = API_URL.concat('auth/info');
export const PROXY_URL = API_URL.concat('proxy/');
export const CONFIG_URL = API_URL.concat('config/');
export const STORE_DVC_URL = API_URL.concat('store/');
