<template>
  <div id="stac-browser" class="p-d-flex p-flex-column h-100 w-100 p-ai-center main-page p-jc-between">
    <header-navbar v-if="!!headerRoutes" :routes="headerRoutes"/>

    <div v-if="isLoading" class="container w-100 h-100 p-pt-5">
      <Awaiter :is-visible="isLoading"/>
    </div>

    <div v-else class="w-100 h-100 p-pt-0">
      <router-view/>
      <!--      <b-alert v-else show variant="danger" class="container">-->
      <!--        <h4 class="alert-heading"><strong> {{ $t('errors.authFail.title') }}</strong></h4>-->
      <!--        <p>-->
      <!--          {{ $t('errors.authFail.description') }}-->
      <!--        </p>-->
      <!--        <p class="mb-0">-->
      <!--          {{ $t('errors.authFail.information') }}-->
      <!--          <div>-->
      <!--            <a :href="login">-->
      <!--              <b-button class="p-mt-2">-->
      <!--                {{ $t('Login') }}-->
      <!--              </b-button>-->
      <!--            </a>-->
      <!--            <hr>-->

      <!--            <b-form @submit="go">-->
      <!--              <b-form-group-->
      <!--                id="select-token" :label="$t('index.specifyToken')" label-for="token"-->
      <!--              >-->
      <!--                <b-form-input id="token" type="password" :value="localToken" @input="setToken" placeholder="token..."/>-->
      <!--                <small> {{ $t('index.specifyTokenDetail') }} </small>-->
      <!--              </b-form-group>-->

      <!--              <b-button type="submit" variant="primary">{{ $t('index.load') }}</b-button>-->

      <!--            </b-form>-->

      <!--          </div>-->
      <!--        </p>-->
      <!--      </b-alert>-->
    </div>


    <footer class="border-rose w-100 footer">
      <div class="w-100 p-px-4 p-py-3 container">
        <text-view type="Small-2" class="">
          © Sharing HUB 2023
        </text-view>
      </div>
    </footer>
  </div>
</template>


<script>
import Vue, {defineComponent} from 'vue';

import HeaderNavbar from "@/_Hub/components/HeaderNavbar.vue";
import TextView from "@/_Hub/components/TextView.vue";
import {BForm, BFormGroup, BFormInput, BootstrapVue, BootstrapVueIcons} from "bootstrap-vue";
import {CONNEXION_MODE, get, getLocalToken, removeLocalToken, setLocalToken} from "@/_Hub/tools/https";
import {CONFIG_URL, LOGIN_URL, PROXY_URL, USER_INFO} from "@/_Hub/Endpoint";
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
    BFormInput, BForm, BFormGroup,
    Awaiter,
    TextView,
    HeaderNavbar,
  },
  data() {
    return {
      isLoading: true,
      defaultToken: undefined,
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
        if (data.mode !== old_data?.mode  && old_data?.mode !== CONNEXION_MODE.DEFAULT_TOKEN) {
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
  },
  beforeMount() {
    this.initWithUserCredentials().then(() => {
      this.fetchTitles();
    });

  },
  methods: {
    async initWithUserCredentials() {
      this.isLoading = true;
      get(PROXY_URL.concat('user'))
        .then(async (userDataResponse) => {
          if (userDataResponse.data) {
            let user = userDataResponse.data;
            const defaultToken = await this.getDefaultToken();
            let token;
            let connexion_mode = CONNEXION_MODE.CONNECTED;
            if (getLocalToken()) {
              token = getLocalToken();
              connexion_mode = CONNEXION_MODE.HEADLESS;
              if (token === defaultToken) {
                user = null;
                connexion_mode = CONNEXION_MODE.DEFAULT_TOKEN;
              }
            } else {
              const {access_token} = (await get(USER_INFO).then((res) => res.data));
              token = access_token;
            }
            this.$store.commit("setUserInfo", {user, token: token, mode: connexion_mode});
            this.isLoading = false;
            if (this.$route.fullPath === "") {
              this.$router.push("/");
            }
          }
        })
        .catch(() => {
          this.defaultInit();
        });
    },

    async getDefaultToken() {
      return get(CONFIG_URL).then((configResponse) => {
        return configResponse.data?.gitlab?.oauth['default-token'];
      });
    },

    async defaultInit() {
      this.defaultToken = await this.getDefaultToken();
      setLocalToken(this.defaultToken);
      this.$store.commit("setUserInfo", {user: null, token: this.defaultToken, mode: CONNEXION_MODE.DEFAULT_TOKEN});
      this.isLoading = false;
      if (this.$route.fullPath === "") {
        this.$router.push("/");
      }
    },

    async fetchTitles() {
      return get(CONFIG_URL).then((response) => {
        if (response.data) {
          let entries = {};
          Object.entries(response.data.topics).forEach(([topic, values]) => {
            entries[topic] = values['locales'];
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
          icon = "book";
        } else if (key.toLowerCase().includes("model")) {
          icon = "box-seam";
        } else if (key.toLowerCase().includes("dataset")) {
          icon = "view-list";
        } else {
          icon = "view-stacked";
        }
        const val = value[locale] ? value[locale] : value['en'];
        routes.push(Object.assign(
          {route: key, icon}, val)
        );
      });
      return routes;
    }


  },
});

</script>


<style scoped lang="scss">
@import "assets/colors";


.main-page {
  .footer {
    display: none;
    background: rgba($grey-color, 1);
  }
}
</style>
