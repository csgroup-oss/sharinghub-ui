import axios from "axios";
import Cookies from "js-cookie";

let httpService = axios.create({});

export async function get(url = undefined) {
  const CSRFTOKEN = Cookies.get("csrftoken") || "";
  return await httpService.get(url,
    {
      headers: {
        "Accept": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "X-CSRFToken": CSRFTOKEN,
      },
      withCredentials: true,
    }
  );
}
