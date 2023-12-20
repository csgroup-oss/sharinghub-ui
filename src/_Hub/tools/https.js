import axios from "axios";
import Cookies from "js-cookie";

let httpService = axios.create({});

export async function get(url = undefined) {
  let CSRFTOKEN = Cookies.get("csrftoken") || undefined;
  const LOCAL_TOKEN = getLocalToken() ||undefined;
  let headers = {
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
  };
  if(CSRFTOKEN && !LOCAL_TOKEN){
    headers = Object.assign(headers, { "X-CSRFToken": CSRFTOKEN});
  }
  if(LOCAL_TOKEN){
      headers = Object.assign(headers, {"X-Gitlab-Token" : LOCAL_TOKEN,});
  }
  return await httpService.get(url,
    {
      headers: headers,
      withCredentials: true,
    }
  );
}

export async function post(url = undefined, data = {}) {
  const CSRFTOKEN = Cookies.get("csrftoken") || undefined;
  const LOCAL_TOKEN = getLocalToken() ||undefined;
  let headers = {
      "Accept": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
  };
  if(CSRFTOKEN && !LOCAL_TOKEN){
    headers = Object.assign(headers, { "X-CSRFToken": CSRFTOKEN});
  }
  if(LOCAL_TOKEN){
      headers = Object.assign(headers, {"X-Gitlab-Token" : LOCAL_TOKEN,});
    }
  return await httpService.post(url,
    data,
    {
      headers: headers,
      withCredentials: true,
    }
  );
}


export function setLocalToken(token){
  if(!token) throw new Error("token is undefined");
  window.localStorage.clear();
  window.localStorage.setItem("gitlab_token", token);
}

export function getLocalToken(){
  return window.localStorage.getItem("gitlab_token");
}

export function removeLocalToken(){
   window.localStorage.removeItem("gitlab_token");
}
export const CONNEXION_MODE =  {
  "HEADLESS" : "HEADLESS",
  "CONNECTED" : "CONNECTED",
  "DEFAULT_TOKEN" : "DEFAULT_TOKEN",
};
