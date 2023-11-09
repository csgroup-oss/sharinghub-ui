

export const  BASE_URL  = "http://localhost:8000/";
export const REPOSITORY_URL = "gitlab.si.c-s.fr";
export const STAC_ROOT_URL = BASE_URL.concat(REPOSITORY_URL).concat("/").concat("stac/");
export const LOGIN_URL = (repository = REPOSITORY_URL) => BASE_URL.concat(repository).concat("/auth/login");
export const LOGOUT_URL = (repository = REPOSITORY_URL) => BASE_URL.concat(repository).concat("/auth/logout");
export const AUTH_INFO_URL = BASE_URL.concat(REPOSITORY_URL).concat("/auth/info");
