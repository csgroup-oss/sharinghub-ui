export const BASE_URL  = window.location.origin.concat("/");

export const STAC_ROOT_URL = BASE_URL.concat("stac/");
export const STAC_SEARCH = BASE_URL.concat("stac/search");
export const LOGIN_URL = BASE_URL.concat("auth/login?redirect_uri=".concat(window.location.origin));
export const LOGOUT_URL = BASE_URL.concat("auth/logout");
export const USER_INFO = BASE_URL.concat("auth/info");
export const PROXY_URL = BASE_URL.concat("api/");
export const CONFIG_URL = BASE_URL.concat("config/");
export const DOCS_URL = BASE_URL.concat("docs/");
export const STORE_DVC_URL = BASE_URL.concat("store/");
