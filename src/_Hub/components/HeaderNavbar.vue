<template>
  <header class="nav-bar w-100 p-pb-2">
    <div class="container p-px-4 p-py-1 p-d-flex p-ai-center p-jc-between">
      <div class="p-d-flex p-ai-center">
        <text-view class="p-mr-4">
          <router-link to="/" class="cursor">
            <h3><img width="40px" height="40px" :src="logo"> SharingHUB</h3>
          </router-link>
        </text-view>
        <div class="">
          <b-input-group size="md" class="100">
            <b-form-input type="text" v-model="value" @keyup.enter="handleEnter()"
                          :placeholder="$t('fields.search_placeholder') ">
            </b-form-input>
            <b-input-group-prepend style="height: 33px">
              <b-button @click="handleEnter()" :disabled="!canSearch" variant="outline-primary">
                <b-icon icon="search"/>
              </b-button>
            </b-input-group-prepend>
          </b-input-group>
        </div>
      </div>

      <div class="p-d-flex p-ai-center p-jc-between">
        <template v-if="routes.length > 0">
          <router-link v-for="item in routes" class="mx-1" :to="`/${item.route}`">
            <nav-item :class="['p-mx-1 p-d-flex p-ai-center', $route.params?.pathMatch===item.route && 'active']">
              <img v-if="!!item.ico" width="20px" height="20px" :src="item.ico"/>
              <b-icon v-else :icon="item.icon"/>
              <text-view type="header__b14"> {{ item.title }}</text-view>
            </nav-item>
          </router-link>
        </template>
        <div class="p-divider--vertical"/>

        <div class="p-d-flex p-ai-center">
          <a :href="docs_url" target="_blank">
            <nav-item class="p-mx-1">
              <b-icon icon="book"/>
              <text-view type="header__b14"> Docs</text-view>
            </nav-item>
          </a>

          <Localisation/>

          <b-dropdown v-if="isAuthenticated" size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
            <template #button-content>
              <b-avatar size="40" variant="info" :src="avatar_url"/>
            </template>
            <b-dropdown-item>
              <text-view type="Small-1">{{ auth?.user?.name }}</text-view>
            </b-dropdown-item>
            <b-dropdown-divider/>
            <b-dropdown-item @click="logout" href="#"> {{ $t('fields.Logout') }}</b-dropdown-item>
          </b-dropdown>

          <template v-else>
            <div v-if="$route.name !== 'Login'" class="p-ml-3">
              <b-button size="sm" to="login" variant="dark">
                {{ $t('fields.login') }}
                <b-icon-box-arrow-in-right/>
              </b-button>
            </div>
          </template>
        </div>


      </div>
    </div>
  </header>
</template>

<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import NavItem from "@/_Hub/components/HeaderNavbar/NavItem.vue";
import {DOCS_URL, LOGIN_URL, LOGOUT_URL, PROXY_URL} from "@/_Hub/Endpoint";
import {mapState} from "vuex";
import {CONNEXION_MODE, get} from "@/_Hub/tools/https";
import Localisation from "@/components/Localisation.vue";
import logoImage from "@/assets/img/logo.png";


export default defineComponent({
  name: "HeaderNavbar",
  components: {
    Localisation,
    NavItem,
    TextView,
  },
  props: {
    routes: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      isAuthenticated: false,
      isLoading: false,
      value: null,
      avatar_url: undefined,
      canSearch: true,
      logo: logoImage,
    };
  },
  computed: {
    ...mapState(['auth', 'catalogUrl', 'title', 'data', 'url']),
    login() {
      return LOGIN_URL;
    },
    docs_url() {
      return DOCS_URL + this.$root.$i18n.locale;
    },
  },
  watch: {
    auth: {
      immediate: true,
      async handler(data) {
        if (data.mode !== CONNEXION_MODE.DEFAULT_TOKEN) {
          this.avatar_url = data?.user?.avatar_url;
          if (data?.user?.email) {
            get(PROXY_URL.concat(`avatar?email=${data.user.email}`)).then(response => {
              if (response.data) {
                this.avatar_url = response.data.avatar_url;
              }
            });
          }
          this.isAuthenticated = !!data.user;
        }
        if (data.mode === CONNEXION_MODE.CONNECTED) {
          this.canSearch = true;
        } else if (data.mode === CONNEXION_MODE.PRIVATE_TOKEN) {
          this.canSearch = true;
        } else {
          this.canSearch = !!data.user;
        }
      }
    },
  },
  methods: {
    async logout() {
      get(LOGOUT_URL).then((response) => {
        if (response) {
          this.isAuthenticated = false;
          const auth = {...this.auth, mode: CONNEXION_MODE.DEFAULT_TOKEN, user: null};
          this.$store.commit("setUserInfo", auth);
        }
      });
    },
    handleEnter() {
      if (!this.canSearch) {
        return;
      }
      if (this.$route.name !== "search") {
        this.$router.push(
          {
            path: `/search/`,
            query: {q: this.value}
          });
      }
      this.value = null;
    },

  },

});
</script>

<style scoped lang="scss">
@import "../../assets/colors";
@import "../../theme/variables";

.nav-bar {
  border-bottom: rgba($secondary-color, 0.05) 2px solid;
  padding-top: 8px !important;

  h3 {
    font-size: 1.5rem;
    padding-bottom: 0 !important;
    margin-bottom: 0 !important;
  }

  input {
    height: 33px;
  }

  .p-divider {
    border-left: solid 1px rgba($secondary-color, 0.4);
  }

  .cursor {
    &:hover {
      text-decoration: none !important;
      text-underline: none !important;
    }
  }

  .active {
    border-bottom: solid map-get($theme-colors, 'primary') 2px;
    border-radius: 0 !important;
    background-color: rgba(map-get($theme-colors, 'primary'), 0.3);
  }
}


</style>
