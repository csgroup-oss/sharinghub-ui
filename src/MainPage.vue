<template>
  <div class="">
    <div id="stac-browser" class="flex flex-column h-100 w-100 align-items-center main-page">
      <header-navbar
        v-if="!!headerRoutes"
        :routes="headerRoutes"
        :external-links="headerExternalLinks"
      />

      <div v-if="!!alert_message" class="container">
        <b-alert class="" show :variant="alert_message.type" fade dismissible
                 @dismissed="closeAlert(alert_message.url)">
          <div class="flex justify-items-start">
            <div class="mr-2">
              <b-icon icon="exclamation-circle-fill" variant="dark"/>
            </div>
            <div>
              <text-view class="block" type="header__b14">{{ alert_message.title }}</text-view>
              <text-view class="block" type="header__13">{{ alert_message.message }}</text-view>
              <b-button v-if="alert_message.url"
                        size="sm" class="mt-2"
                        variant="light"
                        @click="$event => closeAlert(alert_message.url)"
              >
                {{ $t('fields.i_understand') }}
              </b-button>

            </div>
          </div>
        </b-alert>
      </div>

      <div class="body-content w-100 h-100">
        <div v-if="isLoading" class="container w-100 h-100 pt-5">
          <Awaiter :is-visible="isLoading"/>
        </div>

        <div v-else class="w-100 h-100 pt-0">
          <router-view/>
        </div>

      </div>


    </div>

    <footer class="w-100 mt-6">
      <div class="px-4 py-3 container footer">

        <div class="flex justify-content-between  sm:flex-column md:flex-row lg:flex-row ">
          <b-button-group size="sm" class="left">
            <b-button size="sm" variant="link" disabled>
              {{ $t("fields.copyright", [new Date().getFullYear()]) }}
            </b-button>
          </b-button-group>

          <b-button-group  size="sm" class="right p-flex-sm-column p-flex-md-row p-flex-lg-row ">
            <b-button size="sm" variant="link" :href="docs('/legal/privacy')">
              {{ $t("fields.privacy") }}
            </b-button>
          </b-button-group>

        </div>
      </div>
    </footer>

  </div>

</template>


<script>
import Vue, {defineComponent} from 'vue';

import HeaderNavbar from "@/_Hub/components/HeaderNavbar.vue";
import {BootstrapVue, BootstrapVueIcons} from "bootstrap-vue";
import {
  CONNEXION_MODE,
  get,
  getAlertLastDate,
  getLocalToken,
  removeLocalToken,
  setAlertLastDate
} from "@/_Hub/tools/https";
import {CONFIG_URL, DOCS_URL, LOGIN_URL, PROXY_URL, STAC_ROOT_URL, USER_INFO} from "@/_Hub/Endpoint";
import {mapState} from "vuex";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import I18N from "@radiantearth/stac-fields/I18N";
import {loadMessages, translateFields} from "@/i18n";
import "./assets/base.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css';
import {DateTime, Interval} from "luxon";
import TextView from "@/_Hub/components/TextView.vue";

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

export default defineComponent({
  name: "MainPage",
  components: {
    TextView,
    Awaiter,
    HeaderNavbar,
  },
  data() {
    return {
      isLoading: true,
      headerRoutes: undefined,
      headerExternalLinks: undefined,
      alert_message: undefined,
      connexion_mode: CONNEXION_MODE.DEFAULT_TOKEN,
    };
  },
  computed: {
    ...mapState(['auth', 'conformsTo', 'uiLanguage', 'provideConfig', 'pathPrefix']),
    login() {
      return LOGIN_URL;
    }
  },
  watch: {
    auth: {
      immediate: true,
      async handler(data, old_data) {
        if (!this.isLoading) {
          if (data.mode !== old_data?.mode && old_data?.mode !== CONNEXION_MODE.DEFAULT_TOKEN) {
            removeLocalToken();
            const {categories, external_urls} = await this.getConfig();
            this.headerRoutes = this.buildRouting(categories, this.uiLanguage);
            this.headerExternalLinks = this.buildExternalLinks(external_urls, this.uiLanguage);
            await this.initWithUserCredentials();
            this.$store.commit("setEntriesRoutes", this.headerRoutes);
          }
        }

      }
    },
    uiLanguage: {
      immediate: true,
      async handler(locale) {
        if (!locale || !this.provideConfig) {
          return;
        }

        // Update stac-fields
        I18N.locales = [locale];
        I18N.translate = translateFields;

        // Load messages
        await loadMessages(locale);

        // Set the locale for vue-i18n
        this.$root.$i18n.locale = locale;

        // Update the HTML lang tag
        document.documentElement.setAttribute("lang", locale);
        const {categories, external_urls, alert_info} = this.provideConfig;
        this.headerRoutes = this.buildRouting(categories, locale);
        this.headerExternalLinks = this.buildExternalLinks(external_urls, locale);
        this.$store.commit("setEntriesRoutes", this.headerRoutes);
        const connexion_mode = this.auth.mode;
        if (!this.isLoading && this.showAlert(alert_info, connexion_mode)) {
          this.alert_message = this.buildAlertInfo(alert_info, this.uiLanguage);
        }
      }
    },
    $route: {
      immediate: true,
      handler() {
        if (!this.isLoading) {
          const {alert_info} = this.provideConfig;
          const alert_message = this.buildAlertInfo(alert_info, this.uiLanguage);
          const connexion_mode = this.auth.mode;
          if (!this.isLoading && this.showAlert(alert_message, connexion_mode)) {
            this.alert_message = alert_message;
          }

        }
      }
    }
  },
  beforeCreate() {
    removeLocalToken();
    this.$store.commit("setBaseUrl", STAC_ROOT_URL);
  },
  async beforeMount() {
    const {search} = window.location;
    if(search){
      const regex = /(?:\?|&)redirect=([^& ]*)/;
      const match = search.match(regex);
      if(match){
        const redirectContent = decodeURIComponent(match[1]);
        const url = new URL(`${window.origin}${this.pathPrefix}/#/${redirectContent}`);
        window.location.replace(url.toString());
      }
    }
    const {categories, external_urls, alert_info} = await this.getConfig();
    this.headerRoutes = this.buildRouting(categories, this.uiLanguage);
    this.headerExternalLinks = this.buildExternalLinks(external_urls, this.uiLanguage);
    this.$store.commit("setEntriesRoutes", this.headerRoutes);
    const connexion_mode = await this.initWithUserCredentials();
    if (this.showAlert(alert_info, connexion_mode)) {
      this.alert_message = this.buildAlertInfo(alert_info, this.uiLanguage);
    }

  },
  methods: {
    docs(path) {
      return DOCS_URL.concat(path);
    },
    async initWithUserCredentials() {
      this.isLoading = true;
      return get(PROXY_URL.concat('user'))
        .then(async (userDataResponse) => {
          if (userDataResponse.data) {
            let user = userDataResponse.data;
            let token;
            let connexion_mode = CONNEXION_MODE.CONNECTED;
            if (getLocalToken()) {
              token = getLocalToken();
              connexion_mode = CONNEXION_MODE.PRIVATE_TOKEN;
            } else {
              try {
                const {access_token} = (await get(USER_INFO).then((res) => res.data));
                token = access_token;
              } catch (e) {
                connexion_mode = CONNEXION_MODE.DEFAULT_TOKEN;
              }
            }
            await this.$store.commit("setUserInfo", {user, token: token, mode: connexion_mode});
            this.isLoading = false;
            return connexion_mode;
          }
          return undefined;
        })
        .catch(() => {
          this.isLoading = false;
          if (!["Login", "Home"].includes(this.$route.name)) {
            this.$router.push("/login");
          }
        });
    },

    async getConfig() {
      return get(CONFIG_URL).then(async (response) => {
        const {data} = response;
        if (data) {
          await this.$store.commit("setProvideConfig", data);
          return data;
        }
        return undefined;
      });
    },

    buildRouting(categories = {}, locale = 'en') {
      let entries = {};
      let routes = [];
      Object.entries(categories).forEach(([category, values]) => {
        entries[category] = {...values['locales'], icon: values["icon"]};
      });

      if (typeof entries !== "object") {
        throw new Error("entries point are undefined");
      }
      Object.entries(entries).map(([key, value]) => {
        let icon;
        if (key.toLowerCase().includes("processor")) {
          icon = "tools";
        } else if (key.toLowerCase().includes("model")) {
          icon = "box-seam";
        } else if (key.toLowerCase().includes("dataset")) {
          icon = "view-list";
        } else {
          icon = "view-stacked";
        }
        const val = value[locale] ? value[locale] : value['en'];
        routes.push({...val, route: key, ico: value["icon"] || icon});
      });
      return routes;
    },

    buildExternalLinks(external_urls = [], locale = 'en') {

      const normalize_link = (link = {}) => {
        if (!link.dropdown) {
          let result = {...link, ...link.locales[locale]};
          delete result.locales;
          return result;
        } else {
          let result = {...link, ...link.locales[locale], dropdown: link.dropdown.map(normalize_link)};
          delete result.locales;
          return result;
        }
      };
      return external_urls.map(normalize_link);
    },

    buildAlertInfo(alert_info = {}, locale = 'en') {
      let entries = {};
      const {locales, ...rest} = alert_info;
      entries = {...rest, ...locales[locale]};
      return entries;
    },

    showAlert(alert_message = {}, connexion_mode) {
      const route_name = this.$route.name;
      if (['Login'].includes(route_name)
        || [CONNEXION_MODE.CONNECTED, CONNEXION_MODE.PRIVATE_TOKEN].includes(connexion_mode)) {
        this.alert_message = undefined;
        return false;
      }
      const {timeout} = alert_message;
      const last_date_showed = getAlertLastDate();
      if (!last_date_showed) {
        return true;
      }
      const now = DateTime.now();
      const date = DateTime.fromISO(last_date_showed);
      const interval = Interval.fromDateTimes(date, now);
      const interval_days = interval.length('days');
      return interval_days ? interval_days >= timeout : false;
    },

    closeAlert(url) {
      const isValidUrl = (string) => {
        let regex = new RegExp('^(https?:\\/\\/)?' + '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
          '((\\d{1,3}\\.){3}\\d{1,3}))' + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + '(\\?[;&a-z\\d%_.~+=-]*)?' + '(\\#[-a-z\\d_]*)?$', 'i');
        return !!regex.test(string);
      };
      this.alert_message = undefined;
      setAlertLastDate(DateTime.now().toISO());
      if (isValidUrl(url)) {
        window.open(url);
      } else {
        this.$router.push(url);
      }
    }


  },
});

</script>


<style scoped lang="scss">
@import "assets/colors";
@import "theme/variables";

footer {
  bottom: 0;
  border-top: 1px rgba(map-get($theme-colors, "secondary"), 0.1) solid;
}

.btn-sm {
  font-size: 0.8rem;
}

@media screen and (max-width:575px){
  .body-content{
  margin-top:5.5rem;
  }
}
@media screen and (min-width:576px ) and  (max-width:978px ) {
  .body-content{
    margin-top:6.5rem;
  }
}
@media screen and (min-width:979px ) and (max-width:1581px){
  .body-content{
    margin-top:4.6rem;
  }
}
</style>
