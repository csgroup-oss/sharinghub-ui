<template>
  <div id="stac-browser" class="p-d-flex p-flex-column h-100 w-100 p-ai-center main-page p-jc-between">
    <header-navbar />

    <div v-if="isLoading" class="container w-100 h-100 p-pt-5">
      <Awaiter :is-visible="isLoading"/>
    </div>

    <div v-else class="w-100 h-100 p-pt-0">
      <router-view v-if="isAuthenticated"/>
      <b-alert v-else show variant="danger" class="container">
        <h4 class="alert-heading"><strong> {{ $t('errors.authFail.title') }}</strong></h4>
        <p>
          {{ $t('errors.authFail.description') }}
        </p>
        <hr>
        <p class="mb-0">
          {{ $t('errors.authFail.information') }}
          <div>
            <a :href="login">
              <b-button class="p-mt-2">
                {{ $t('Login') }}
              </b-button>
            </a>

          </div>
        </p>
      </b-alert>
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
import {BootstrapVue, BootstrapVueIcons} from "bootstrap-vue";
import "./assets/base.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css';
import {get} from "@/_Hub/tools/https";
import {LOGIN_URL, PROXY_URL, USER_INFO} from "@/_Hub/Endpoint";
import {mapState} from "vuex";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import I18N from "@radiantearth/stac-fields/I18N";
import {loadMessages, translateFields} from "@/i18n";

Vue.use(BootstrapVue);
Vue.use(BootstrapVueIcons);

export default defineComponent({
  name: "MainPage",
  components: {
    Awaiter,
    TextView,
    HeaderNavbar,
  },
  data() {
    return {
      isAuthenticated: false,
      isLoading: true,
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
      async handler(data) {
        this.isLoading = false;
        this.isAuthenticated = !!(data?.user && data?.token);
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
      }
    }
  },
  beforeMount() {
    this.fetchUser();
  },
  methods: {
    async fetchUser() {
      this.isLoading = true;
      get(PROXY_URL.concat('/user'))
        .then(async (userDataResponse) => {
          if (userDataResponse.data) {
            const user = userDataResponse.data;
            let {access_token} =  (await get(USER_INFO).then((res) => res.data));
            this.$store.commit("setUserInfo", {user, token : access_token});
             this.isLoading = false;
            if (this.$route.fullPath === "") {
              this.$router.push("/models");
            }
          }
        }).catch((reason) => {
        console.log('------ USER IS DISCONNECT -----', reason);
        this.isLoading = false;
        this.$store.commit("setUserInfo", null);
      });
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
