import Vue from "vue";
import VueRouter from "vue-router";
import MainPage from "@/MainPage.vue";
import i18n, {loadDefaultMessages} from './i18n';
import "primeflex/primeflex.css";


import Vuex from "vuex";
import getStore from "@/store";
import CONFIG from "@/config";
import {getRoutes_2} from "@/router";


Vue.use(VueRouter);
export const router = new VueRouter({
  mode: CONFIG.historyMode,
  base: CONFIG.pathPrefix,
  routes: getRoutes_2(CONFIG)
});


Vue.use(Vuex);
const store = getStore(CONFIG, {});

export default function init() {
  return loadDefaultMessages().then(() => {
    return new Vue({
      store,
      router,
      i18n,
      render: h => h(MainPage)
    }).$mount("#stac-browser");
  });
}
