<template>
  <header class="nav-bar w-100 p-pb-2">
    <div class="container p-px-4 p-py-1 p-d-flex p-ai-center p-jc-between">
      <div class="p-d-flex p-ai-center">
        <text-view class="p-mr-4">
          <router-link to="/" class="cursor">
            <h3><img width="40px" height="40px" :src="logo"> SharingHUB</h3>
          </router-link>
        </text-view>
        <div class="" v-if="['md','lg'].includes(size)">
          <b-input-group size="md" class="">
            <b-form-input :disabled="!canSearch" type="text" v-model="value" @keyup.enter="handleEnter()"
                          :placeholder="$t('fields.search_placeholder') ">
            </b-form-input>
            <b-input-group-prepend style="height: 33px">
              <b-button @click="handleEnter()" :disabled="!canSearch" variant="outline-primary">
                <b-icon style="padding-bottom: 3px;" icon="search"/>
              </b-button>
            </b-input-group-prepend>
            <b-input-group-prepend style="height: 33px">
              <b-button :disabled="!canSearch" to="/search/" id="tooltip-target-advance-research"
                        variant="outline-secondary">
                <b-icon style="padding-bottom: 3px;" icon="sliders"/>
              </b-button>
            </b-input-group-prepend>
            <b-tooltip target="tooltip-target-advance-research" triggers="hover">
              <text-view>{{ $t('fields.advanced_search') }}</text-view>
            </b-tooltip>
          </b-input-group>
        </div>
      </div>

      <div v-if="['lg'].includes(size)" class="p-d-flex p-ai-center p-jc-between">
        <template v-if="routes.length > 0">
          <router-link v-for="item in routes" class="" :to="`/${item.route}`">
            <nav-item :class="['p-mx-1 p-d-flex p-ai-center', isActiveRoute(item.route) && 'active']">
              <img v-if="!!item.ico" width="20px" height="20px" :src="item.ico"/>
              <b-icon v-else :icon="item.icon"/>
              <text-view type="header__b13"> {{ item.title }}</text-view>
            </nav-item>
          </router-link>

        </template>
        <div class="p-divider--vertical"/>
        <div class="p-d-flex p-ai-center">
          <div v-for="link in externalLinks">
            <a v-if="link.url" :href="link.url" target="_blank">
              <nav-item class="p-mx-1">
                <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon"/>
                <text-view type="header__b13"> {{ link.name }}</text-view>
              </nav-item>
            </a>
            <b-dropdown v-if="link.dropdown" right size="sm" variant="link" toggle-class="text-decoration-none"
                        no-caret>
              <template #button-content>
                <nav-item class="p-mx-1">
                  <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon"/>
                  <text-view type="header__b13"> {{ link.name }}</text-view>
                </nav-item>
              </template>
              <b-dropdown-item v-for="sublink in link.dropdown" :href="sublink.url">
                <img v-if="!!sublink.icon" width="20px" height="20px" :src="sublink.icon"/>
                {{ sublink.name }}
              </b-dropdown-item>


            </b-dropdown>

          </div>
          <Localisation/>
        </div>
        <b-dropdown right v-if="isAuthenticated" size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
          <template #button-content>
            <b-avatar size="40" variant="info" :src="avatar_url"/>
          </template>
          <b-dropdown-item>
            <text-view type="Small-1">{{ auth?.user?.name }}</text-view>
          </b-dropdown-item>
          <b-dropdown-divider/>
          <b-dropdown-item @click="logout" href="#"> {{ $t('fields.Logout') }}</b-dropdown-item>
        </b-dropdown>
        <div v-else class="p-ml-3">
          <b-button size="sm" :to="$route.name === 'Login' ? '?': '/login'" variant="dark">
            {{ $t('fields.login') }}
            <b-icon-box-arrow-in-right/>
          </b-button>
        </div>
      </div>


      <div v-if="['md','sm'].includes(size)" class="p-d-flex p-ai-center">
        <b-dropdown right v-if="isAuthenticated" size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
          <template class="" #button-content>
            <b-avatar size="40" variant="info" :src="avatar_url"/>
          </template>
          <b-dropdown-item>
            <text-view class="" type="">{{ auth?.user?.name }}</text-view>
          </b-dropdown-item>
          <b-dropdown-divider/>
          <b-dropdown-item @click="logout" href="#"> {{ $t('fields.Logout') }}</b-dropdown-item>
        </b-dropdown>
        <b-button variant="outline-dark" class="mx-3" size="sm"
                  v-b-toggle.sidebar-menu>
          <b-icon icon="justify"/>
        </b-button>
      </div>


      <b-sidebar id="sidebar-menu" sidebar-class="border-right">
        <div class="px-3 py-2 p-d-flex p-flex-column">
          <template v-if="routes.length > 0">
            <router-link v-for="item in routes" class="mx-1 mt-3" :to="`/${item.route}`">
              <nav-item :class="['p-mx-1 p-d-flex p-ai-center', isActiveRoute(item.route) && 'active']">
                <img v-if="!!item.ico" width="20px" height="20px" :src="item.ico"/>
                <b-icon v-else :icon="item.icon"/>
                <text-view type="header__b14"> {{ item.title }}</text-view>
              </nav-item>
            </router-link>
          </template>

          <div class="mx-1 mt-3">
            <template v-for="link in externalLinks">
              <a v-if="link.url" :href="link.url" target="_blank">
                <nav-item class="p-mx-1">
                  <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon"/>
                  <text-view type="header__b14"> {{ link.name }}</text-view>
                </nav-item>
              </a>
              <b-dropdown v-if="link.dropdown" left size="sm" variant="link" toggle-class="text-decoration-none"
                          no-caret>
                <template #button-content>
                  <nav-item class="p-mx-1">
                    <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon"/>
                    <text-view type="header__b14"> {{ link.name }}</text-view>
                  </nav-item>
                </template>
                <b-dropdown-item v-for="sublink in link.dropdown" :href="sublink.url">
                  <img v-if="!!sublink.icon" width="20px" height="20px" :src="sublink.icon"/>
                  {{ sublink.name }}
                </b-dropdown-item>
              </b-dropdown>
            </template>

            <Localisation class="mt-3"/>
            <div v-if="!isAuthenticated" class="mt-5">
              <b-button size="sm" :to="$route.name === 'Login' ? '?': '/login'" variant="dark">
                {{ $t('fields.login') }}
                <b-icon-box-arrow-in-right/>
              </b-button>
            </div>
          </div>

        </div>
      </b-sidebar>
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
    },
    externalLinks: {
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
      docs_url: DOCS_URL,
      size: "lg",
    };
  },
  computed: {
    ...mapState(['auth', 'catalogUrl', 'title', 'data', 'url', 'provideConfig']),
    login() {
      return LOGIN_URL;
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
  beforeMount() {
    this.updateNavbar({width: window.innerWidth});
    window.onresize = (ev) => {
      const {innerWidth: width} = ev.currentTarget;
      this.updateNavbar({width});
    };
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
    isActiveRoute(routeKey) {
      return this.$route.path.split("/")[3] === routeKey || routeKey === this.$route.params?.pathMatch;
    },
    handleEnter() {
      if (!this.canSearch) {
        return;
      }
      const routeName = this.$route.name;

      let path = "";
      let _query = {};
      switch (routeName) {
        case "Search":
        case "Home":
        case "FeatureItems":
          path = "/simple-search";
          this.$router.push({path, query: {q: this.value, collections: this.routes.map(el => el.route).join(",")}});
          this.value = null;
          break;
        case "SimpleSearch":
        case "DynamicListSTAC":
          path = "";
          if (this.value !== null) {
            const {collections, topics} = this.$route.query;
            if (collections) {
              _query = {collections};
            }
            if (topics) {
              _query = {..._query, topics};
            }
            this.$router.push({path, query: {q: this.value, ..._query}});
            this.value = null;
          }
          break;
        default:
          this.value = null;
          return;

      }

    },
    updateNavbar({width}) {
      if (width <= 800) {
        this.size = "sm";
      } else if (width <= 1584) {
        this.size = "md";
      } else {
        this.size = "lg";
      }
    }
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
