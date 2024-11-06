import Vue from 'vue';
import VueRouter from 'vue-router';
import MainPage from '@/MainPage.vue';
import i18n, {loadDefaultMessages} from './i18n';
import 'primeflex/primeflex.css';

import Vuex from 'vuex';
import getStore from '@/store';
import CONFIG from '@/config';
import {getRoutes, getServerConfig} from '@/router';

Vue.use(VueRouter);
Vue.use(Vuex);

export default function init() {
  return loadDefaultMessages().then(() => {
    return getServerConfig().then((serverConfig) => {
      const baseConfig = serverConfig ? {...CONFIG, provideConfig: serverConfig} : CONFIG;
      const store = getStore(baseConfig, {});
      const router = new VueRouter({
        mode: CONFIG.historyMode,
        base: CONFIG.pathPrefix,
        routes: getRoutes(baseConfig)
      });
      return new Vue({
        store,
        router,
        i18n,
        render: h => h(MainPage)
      }).$mount('#stac-browser');
    });
  });
}
