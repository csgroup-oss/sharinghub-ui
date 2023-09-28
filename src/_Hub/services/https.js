import axios from "axios";

let httpService = axios.create({});

export async function get(url = undefined) {
  return await httpService.get(url);
}
