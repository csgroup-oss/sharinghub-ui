import axios from "axios";


let httpService = axios.create({
  baseURL: "https://catlog.free.beeceptor.com"
});

export async function getListModels() {
  try {
    let data = await httpService.get("/models");
    return data.data;
  } catch (ex) {
    return [
      {
        id: 1,
        name: "Microsoft/phi-1_5",
        url: "https://gistac.p2.csgroup.space/gitlab.si.c-s.fr/XoTCyf-YVmTKA7ehsXA9/stac/ai_model/space_applications/mlops-services/gitlab2stac_tests/model-sample",
        keyword: "Text Generation",
        lastUpdated: "1 days ago",
        downloadRate: "1.20M",
        likeRate: "4.5K",
      },
      {
        id: 2,
        name: "Wine Model",
        url: "https://gistac.p2.csgroup.space/gitlab.si.c-s.fr/mWhrtNpoZA1B8NKUWxev/stac/ai_model/space_applications/mlops-services/gitlab2stac_tests/wine-model",
        keyword: "Language Generation",
        lastUpdated: "4 days ago",
        downloadRate: "1.20M",
        likeRate: "4.5K",
      },
      {
        id: 3,
        name: "Dataset Sample",
        url: "https://gistac.p2.csgroup.space/gitlab.si.c-s.fr/mWhrtNpoZA1B8NKUWxev/stac/dataset/space_applications/mlops-services/gitlab2stac_tests/dataset-sample",
        keyword: "Picture detection",
        lastUpdated: "6 days ago",
        downloadRate: "1.20M",
        likeRate: "4.5K",
      },
    ];
  }

}


export async function getModel(id = undefined) {
  try {
    let data = await getListModels();
    return data.find(function (el) {
      return el.id === id;
    });
  } catch (ex) {
    return undefined;
  }

}
