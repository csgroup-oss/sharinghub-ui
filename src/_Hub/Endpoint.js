


export const BASE_URL  = "http://localhost/";
// export const BASE_URL  = window.location.origin.concat("/");
export const REPOSITORY_URL = "gitlab.si.c-s.fr";
export const STAC_ROOT_URL = BASE_URL.concat(REPOSITORY_URL).concat("/").concat("stac/");
export const LOGIN_URL = BASE_URL.concat(REPOSITORY_URL).concat("/auth/login?redirect_uri=".concat(window.location.origin));
export const LOGOUT_URL = BASE_URL.concat(REPOSITORY_URL).concat("/auth/logout");
// export const PROXY_URL = window.location.origin.concat("/").concat(REPOSITORY_URL).concat("/api/");
export const PROXY_URL = BASE_URL.concat(REPOSITORY_URL).concat("/api/");
export const RESOLVE_URL = BASE_URL.concat(REPOSITORY_URL).concat("/resolve/");

