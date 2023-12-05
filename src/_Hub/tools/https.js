import axios from "axios";
import Cookies from "js-cookie";

let httpService = axios.create({});

export async function get(url = undefined) {
  const CSRFTOKEN = Cookies.get("csrftoken") || "";
  const LOCAL_TOKEN = getLocalToken() || "";
  return await httpService.get(url,
    {
      headers: {
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "X-CSRFToken": CSRFTOKEN,
        "X-Gitlab-Token" : LOCAL_TOKEN,
      },
      withCredentials: true,
    }
  );
}

export async function post(url = undefined, data = {}) {
  const CSRFTOKEN = Cookies.get("csrftoken") || "";
  const LOCAL_TOKEN = getLocalToken() || "";
  return await httpService.post(url,
    data,
    {
      headers: {
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "X-CSRFToken": CSRFTOKEN,
        "X-Gitlab-Token" : LOCAL_TOKEN,
      },
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
};
