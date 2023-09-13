import Vue from "vue";
import PrimeVue from "primevue/config";
import MainPage from "@/MainPage.vue";
import i18n, { loadDefaultMessages } from './i18n';
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primevue/resources/primevue.css";
import "primevue/resources/themes/tailwind-light/theme.css";



import "./assets/base.scss";

Vue.use(PrimeVue);

export default function init() {
  return loadDefaultMessages().then(() => {
    return new Vue({
      i18n,
      render: h => h(MainPage)
    }).$mount("#stac-browser");
  });
}
