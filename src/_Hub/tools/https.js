import axios from 'axios';
import Cookies from 'js-cookie';

let httpService = axios.create({});

export async function get(url = undefined) {
  let CSRFTOKEN = Cookies.get('csrftoken') || undefined;
  const LOCAL_TOKEN = getLocalToken() ||undefined;
  let headers = {
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
  };
  if(CSRFTOKEN && !LOCAL_TOKEN){
    headers = Object.assign(headers, { 'X-CSRFToken': CSRFTOKEN});
  }
  if(LOCAL_TOKEN){
      headers = Object.assign(headers, {'X-Gitlab-Token' : LOCAL_TOKEN});
  }
  return await httpService.get(url,
    {
      headers: headers,
      withCredentials: true
    }
  );
}

export async function post(url = undefined, data = {}) {
  const CSRFTOKEN = Cookies.get('csrftoken') || undefined;
  const LOCAL_TOKEN = getLocalToken() ||undefined;
  let headers = {
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
  };
  if(CSRFTOKEN && !LOCAL_TOKEN){
    headers = Object.assign(headers, { 'X-CSRFToken': CSRFTOKEN});
  }
  if(LOCAL_TOKEN){
      headers = Object.assign(headers, {'X-Gitlab-Token' : LOCAL_TOKEN});
    }
  return await httpService.post(url,
    data,
    {
      headers: headers,
      withCredentials: true
    }
  );
}


export function setLocalToken(token){
  if(!token) {throw new Error('token is undefined');}
  window.localStorage.clear();
  window.localStorage.setItem('gitlab_token', token);
}

export function getLocalToken(){
  return window.localStorage.getItem('gitlab_token');
}

export function removeLocalToken(){
   window.localStorage.removeItem('gitlab_token');
}
export const CONNEXION_MODE =  {
  'PRIVATE_TOKEN' : 'PRIVATE_TOKEN',
  'CONNECTED' : 'CONNECTED',
  'DEFAULT_TOKEN' : 'DEFAULT_TOKEN'
};

export const PROVIDERS =  {
  'PRIVATE_TOKEN' : 'token',
  'OAUTH' : 'oauth2'
};

export const MLFLOW_PROVIDER = {
  'MLFLOW_SHARINGHUB' : 'mlflow-sharinghub',
  'MLFLOW_GITLAB' : 'gitlab',
  'MLFLOW' : 'mlflow'
};

export function setAlertLastDate(date){
  if(!date) {throw new Error('date is undefined');}
  window.localStorage.removeItem('alert_last_date');
  window.localStorage.setItem('alert_last_date', date);
}

export function getAlertLastDate(){
  return window.localStorage.getItem('alert_last_date');
}
