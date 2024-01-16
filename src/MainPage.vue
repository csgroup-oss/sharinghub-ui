<template>
  <div class="">
    <div id="stac-browser" class="p-d-flex p-flex-column h-100 w-100 p-ai-center main-page">
      <header-navbar v-if="!!headerRoutes" :routes="headerRoutes"/>

      <div v-if="isLoading" class="container w-100 h-100 p-pt-5">
        <Awaiter :is-visible="isLoading"/>
      </div>

      <div v-else class="w-100 h-100 p-pt-0">
        <router-view/>
      </div>


    </div>

    <footer class="w-100 p-mt-6">
      <div class="p-px-4 p-py-3 container footer">

        <div class="p-d-flex p-jc-between">
          <b-button-group size="sm" class="left">
            <b-button size="sm" variant="link" disabled>
              {{ $t("fields.copyright") }}
            </b-button>
          </b-button-group>

          <b-button-group size="sm" class="right">
            <b-button size="sm" :href="docs('/legal/terms-of-service')" variant="link">
              {{ $t("fields.terms_of_service") }}
            </b-button>
            <b-button size="sm" variant="link" :href="docs('/legal/privacy')">
              {{ $t("fields.privacy") }}
            </b-button>
            <b-button size="sm" variant="link" :href="docs('legal/about-us')">
              {{ $t("fields.about") }}
            </b-button>
          </b-button-group>

        </div>
      </div>
    </footer>

  </div>

</template>


<script>
import Vue, {computed, defineComponent} from 'vue';

import HeaderNavbar from "@/_Hub/components/HeaderNavbar.vue";
import {BootstrapVue, BootstrapVueIcons} from "bootstrap-vue";
import {CONNEXION_MODE, get, getLocalToken, removeLocalToken} from "@/_Hub/tools/https";
import {CONFIG_URL, DOCS_URL, LOGIN_URL, PROXY_URL, STAC_ROOT_URL, USER_INFO} from "@/_Hub/Endpoint";
import {mapState} from "vuex";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import I18N from "@radiantearth/stac-fields/I18N";
import {loadMessages, translateFields} from "@/i18n";
import "./assets/base.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css';

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

export default defineComponent({
  name: "MainPage",
  components: {
    Awaiter,
    HeaderNavbar,
  },
  data() {
    return {
      isLoading: true,
      headerRoutes: undefined,
    };
  },
  computed: {
    ...mapState(['auth', 'conformsTo', 'uiLanguage']),
    login() {
      return LOGIN_URL;
    }
  },
  watch: {
    auth: {
      immediate: true,
      async handler(data, old_data) {
        this.isLoading = false;
        if (data.mode !== old_data?.mode && old_data?.mode !== CONNEXION_MODE.DEFAULT_TOKEN) {
          removeLocalToken();
          this.initWithUserCredentials().then(() => {
            this.fetchTitles();
          });
        }
      }
    },
    uiLanguage: {
      immediate: true,
      async handler(locale) {
        if (!locale) {
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
        const entries = await this.fetchTitles();
        this.headerRoutes = this.buildRouting(entries, locale);
        this.$store.commit("setEntriesRoutes", this.headerRoutes);
      }
    }
  },
  beforeCreate() {
    removeLocalToken();
    this.$store.commit("setBaseUrl", STAC_ROOT_URL);
  },
  beforeMount() {
    this.initWithUserCredentials().then(() => {
      this.fetchTitles();
    });

  },
  methods: {
    docs(path) {
      return DOCS_URL.concat(path);
    },
    async initWithUserCredentials() {
      this.isLoading = true;
      get(PROXY_URL.concat('user'))
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
            this.$store.commit("setUserInfo", {user, token: token, mode: connexion_mode});
            this.isLoading = false;
            if (this.$route.fullPath === "") {
              this.$router.push("/");
            }
          }
        })
        .catch(() => {
          this.isLoading = false;
          if (!["Login", "Home"].includes(this.$route.name)) {
            this.$router.push("/login");
          }
        });
    },

    async fetchTitles() {
      return get(CONFIG_URL).then((response) => {
        if (response.data) {
          let entries = {};
          Object.entries(response.data.categories).forEach(([category, values]) => {
            entries[category] = {...values['locales'], icon: values["icon"]};
          });
          return entries;
        }
      });
    },

    buildRouting(entries, locale = 'en') {
      let routes = [];
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
</style>
