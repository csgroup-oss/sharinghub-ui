import axios from "axios";

export const BASE_URL = "https://gistac.p2.csgroup.space/";
//gistac.p2.csgroup.space/gitlab.si.c-s.fr/Fs_L1T6iXnq6zxGGSu9W/

let httpService = axios.create({});

export async function get(url = undefined) {
  return await httpService.get(url);
}
