<template>
  <b-navbar :class="['w-100', ['sm'].includes(size) && 'fixed']" type="dark" variant="light">
    <b-navbar-brand href="#">
      <text-view class="mr">
        <router-link to="/" class="cursor">
          <h3><img width="40px" height="40px" :src="logo"> SharingHub</h3>
        </router-link>
      </text-view>
    </b-navbar-brand>

    <!-- Search -->
    <template v-if="['md','lg'].includes(size)">
      <research-bar :canSearch="canSearch" :categories="routes" />
    </template>

    <b-collapse id="nav-collapse" is-nav>
      <!-- Right aligned nav items -->
      <b-navbar-nav class="ml-auto align-items-center">
        <template v-if="['lg'].includes(size)">
          <template v-if="routes.length > 0">
            <router-link v-for="item in routes" :key="item.route" :to="`/${item.route}`">
              <nav-item :class="['mx-1 flex align-items-center', isActiveRoute(item.route) && 'active']">
                <img v-if="!!item.ico" width="20px" height="20px" :src="item.ico">
                <b-icon v-else :icon="item.icon" />
                <text-view type="header__b15"> {{ item.title }}</text-view>
              </nav-item>
            </router-link>
          </template>
          <div class="p-divider--vertical" />

          <div v-if="docsUrl">
            <a :href="docsUrl" target="_blank">
              <nav-item class="mx-1">
                <b-icon-journal-bookmark-fill />
                <text-view type="header__b15"> Docs</text-view>
              </nav-item>
            </a>
          </div>
          <div v-for="link in externalLinks" :key="link.name">
            <a v-if="link.url " :href="link.url" target="_blank">
              <nav-item class="mx-1">
                <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon">
                <text-view type="header__b15"> {{ link.name }}</text-view>
              </nav-item>
            </a>
            <b-dropdown
              v-if="link.dropdown" right size="sm" variant="link"
              toggle-class="text-decoration-none" no-caret
            >
              <template #button-content>
                <nav-item style="padding:0 !important;" class="mx-1">
                  <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon">
                  <text-view type="header__b15"> {{ link.name }}</text-view>
                </nav-item>
              </template>
              <b-dropdown-item v-for="sublink in link.dropdown" :href="sublink.url" :key="sublink.name">
                <img v-if="!!sublink.icon" width="20px" height="20px" :src="sublink.icon">
                {{ sublink.name }}
              </b-dropdown-item>
            </b-dropdown>
          </div>
          <Localisation />
          <b-dropdown
            right v-if="isAuthenticated" size="lg" variant="link"
            toggle-class="text-decoration-none" no-caret
          >
            <template #button-content>
              <b-avatar size="40" variant="info" :src="avatar_url" />
            </template>
            <b-dropdown-item>
              <span class="">{{ auth?.user?.name }}</span>
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-group v-if="createProjectLink" class="font-semibold" header="Wizard">
              <b-dropdown-item
                :href="createProjectLink"
                class="w-full flex align-items-center p-0"
              >
                <span class="">{{ $t('actions.newProject') }}</span>
                <b-icon scale="0.7" icon="plus-lg" class="ml-2" />
              </b-dropdown-item>
            </b-dropdown-group>
            <b-dropdown-divider v-if="createProjectLink" />
            <b-dropdown-item @click="logout" href="#"> {{ $t('fields.Logout') }}</b-dropdown-item>
          </b-dropdown>
          <div v-else class="ml-3">
            <b-button v-if="has_provider" size="sm" :href="login" variant="dark">
              {{ $t('fields.login') }}
              <b-icon-box-arrow-in-right />
            </b-button>
            <b-button v-else size="sm" :to="$route.name === 'Login' ? '?': login" variant="dark">
              {{ $t('fields.login') }}
              <b-icon-box-arrow-in-right />
            </b-button>
          </div>
        </template>

        <div v-if="['md','sm'].includes(size)" class="">
          <b-dropdown
            right v-if="isAuthenticated" size="sm" variant="link"
            toggle-class="text-decoration-none" no-caret
          >
            <template #button-content>
              <b-avatar size="30" variant="info" :src="avatar_url" />
            </template>
            <b-dropdown-item>
              <text-view class="" type="">{{ auth?.user?.name }}</text-view>
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-group v-if="createProjectLink" class="font-semibold" header="Wizard">
              <b-dropdown-item
                :href="createProjectLink"
                class="w-full flex align-items-center p-0"
              >
                <span class="">{{ $t('actions.newProject') }}</span>
                <b-icon scale="0.7" icon="plus-lg" class="ml-2" />
              </b-dropdown-item>
            </b-dropdown-group>
            <b-dropdown-divider v-if="createProjectLink" />
            <b-dropdown-item @click="logout" href="#"> {{ $t('fields.Logout') }}</b-dropdown-item>
          </b-dropdown>
          <b-button
            variant="outline-dark" class="mx-3" size="sm"
            v-b-toggle.sidebar-menu
          >
            <b-icon icon="justify" />
          </b-button>
        </div>
      </b-navbar-nav>
    </b-collapse>

    <b-sidebar id="sidebar-menu" sidebar-class="border-right">
      <div class="px-3 py-2 flex flex-column">
        <text-view class="mr-4">
          <router-link to="/" class="cursor">
            <h3><img width="40px" height="40px" :src="logo"> SharingHub</h3>
          </router-link>
        </text-view>

        <div v-if="['sm'].includes(size)" class="my-2">
          <research-bar variant="secondary" :canSearch="canSearch" :categories="routes" />
        </div>

        <template v-if="routes.length > 0">
          <router-link v-for="item in routes" class="mx-1 mt-3" :key="item.route" :to="`/${item.route}`">
            <nav-item
              is-mobile :category="item.route"
              :class="['mx-1 flex align-items-center', isActiveRoute(item.route) && 'active']"
            >
              <img v-if="!!item.ico" width="20px" height="20px" :src="item.ico">
              <b-icon v-else :icon="item.icon" />
              <text-view type="header__b14"> {{ item.title }}</text-view>
            </nav-item>
          </router-link>
        </template>

        <div v-if="docsUrl" class="mt-3">
          <a :href="docsUrl" target="_blank">
            <nav-item class="mx-1">
              <b-icon-journal-bookmark-fill class="ml-2" />
              <text-view type="header__b15"> Docs</text-view>
            </nav-item>
          </a>
        </div>

        <div class="mx-1 mt-1">
          <div v-for="link in externalLinks" :key="link.name">
            <a v-if="link.url" :href="link.url" target="_blank">
              <nav-item class="mx-1">
                <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon">
                <text-view type="header__b14"> {{ link.name }}</text-view>
              </nav-item>
            </a>
            <b-dropdown
              v-if="link.dropdown" right size="sm" variant="link"
              toggle-class="text-decoration-none"
              no-caret
            >
              <template #button-content>
                <nav-item class="mx-1">
                  <img v-if="!!link.icon" width="20px" height="20px" :src="link.icon">
                  <text-view type="header__b14"> {{ link.name }}</text-view>
                </nav-item>
              </template>
              <b-dropdown-item v-for="sublink in link.dropdown" :href="sublink.url" :key="sublink.name">
                <img v-if="!!sublink.icon" width="20px" height="20px" :src="sublink.icon">
                {{ sublink.name }}
              </b-dropdown-item>
            </b-dropdown>
          </div>

          <Localisation :right="true" class="mt-3" />
          <div v-if="!isAuthenticated" class="mt-5">
            <b-button size="sm" :href="$route.name === 'Login' ? '?': login" variant="dark">
              {{ $t('fields.login') }}
              <b-icon-box-arrow-in-right />
            </b-button>
          </div>
        </div>
      </div>
    </b-sidebar>
  </b-navbar>
</template>

<script>
import {defineComponent} from 'vue';
import TextView from '@/_Hub/components/TextView.vue';
import NavItem from '@/_Hub/components/HeaderNavbar/NavItem.vue';
import {LOGIN_URL, LOGOUT_URL, PROXY_URL} from '@/_Hub/Endpoint';
import {mapState} from 'vuex';
import {CONNEXION_MODE, get, PROVIDERS} from '@/_Hub/tools/https';
import Localisation from '@/components/Localisation.vue';
import logoImage from '@/assets/img/logo.png';
import ResearchBar from '@/_Hub/components/HeaderNavbar/ResearchBar.vue';
import Cookies from 'js-cookie';
import Utils from '@/utils';


export default defineComponent({
  name: 'HeaderNavbar',
  components: {
    ResearchBar,
    Localisation,
    NavItem,
    TextView
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
      avatar_url: undefined,
      canSearch: true,
      logo: logoImage,
      size: 'lg',
      research: undefined,
      login_url: LOGIN_URL,
      has_provider: false
    };
  },
  computed: {
    ...mapState(['auth', 'catalogUrl', 'title', 'data', 'url', 'provideConfig', 'uiLanguage', 'pathPrefix', 'windowWidthSize']),
    login() {
      const {path} = this.$route;
      const {auth} = this.provideConfig;
      const redirect = path.substring(1);
      const base_login = '/login';
      if (auth && auth === PROVIDERS.OAUTH) {
        const login_url = this.login_url.endsWith('/') ? this.login_url.slice(0, this.login_url.length-1) : this.login_url;
        return redirect
          ? `${login_url}${this.pathPrefix}?redirect=${redirect}`
          : login_url;
      }
      return base_login;
    },
    docsUrl() {
      const {docs} = this.provideConfig;
      if (!docs.url) {
        return null;
      }
      return docs.url;
    },
    connexion_url() {
      const {redirect} = this.$route.query;
      const login_url = this.login_url.endsWith('/') ? this.login_url.slice(0, this.login_url.length-1) : this.login_url;
      const url = redirect
        ? `${login_url}${this.pathPrefix}?redirect=${redirect}`
        : login_url;
      return url;
    },
    createProjectLink() {
      const {wizard} = this.provideConfig;
      const {url} = wizard;
      if (!url) {
        return null;
      }
      return `${url}${url.endsWith('/') ? '' : '/'}#/create-project?redirect_url=${window.location.origin}`;
    }
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
            }).catch(() =>{
               this.logout();
            });
          }
        }
        if (data.mode === CONNEXION_MODE.CONNECTED) {
          this.canSearch = true;
          this.isAuthenticated = !!data.user;
        } else if (data.mode === CONNEXION_MODE.PRIVATE_TOKEN) {
          this.canSearch = true;
          this.isAuthenticated = !!data.user;
        } else {
          this.canSearch = !!data.user;
          this.isAuthenticated = false;
        }
      }
    },
    uiLanguage: {
      immediate: true,
      handler() {

        Cookies.set('sharinghub_lang', this.uiLanguage);
        const width = window.innerWidth;
        this.updateNavbar({width});
      }
    },
    windowWidthSize:{
      immediate:true,
      handler(width){
        this.updateNavbar({width});
      }
    }
  },
  beforeMount() {
    const {auth} = this.provideConfig;
    this.has_provider = (auth && auth === PROVIDERS.OAUTH);
    this.updateNavbar({width: window.innerWidth});
  },
  methods: {
    async logout() {
      get(LOGOUT_URL).then((response) => {
        if (response) {
          this.isAuthenticated = false;
          const auth = {...this.auth, mode: CONNEXION_MODE.DEFAULT_TOKEN, user: null};
          this.$store.commit('setUserInfo', auth);
        }
      });
    },
    isActiveRoute(routeKey) {
      const category = this.$route.meta?.category;
      const matchedCollection = Utils.extractCollection(this.$route.path);
      if(matchedCollection?.split('/').length > 1) {
        return matchedCollection.split('/')[1] === routeKey;
      }
      return  routeKey === category;
    },
    updateNavbar({width}) {
      let smbreak =  615;
      let midbreak = this.uiLanguage === 'en' ? 1300 : 1380;
      if (this.externalLinks.length > 0) {
        midbreak +=  this.uiLanguage === 'en' ? 65 : 70;
      }
      if (!this.isAuthenticated) {
         midbreak += this.uiLanguage === 'en' ? 0 : 32;
      }
      if (width <= smbreak) {
        this.size = 'sm';
      } else if (width <= midbreak) {
        this.size = 'md';
      } else {
        this.size = 'lg';
      }
    }
  }

});
</script>

<style scoped lang="scss">
@import "../../assets/colors";
@import "../../theme/variables";

.navbar {
  border-bottom: rgba($secondary-color, 0.05) 2px solid;
  background: transparent !important;
  padding-top: 8px !important;

  .p-divider--vertical {
    height: 33px !important;
  }

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

  .btn-wizard {
    padding: 5px !important;
    font-size: 14px;
  }

  .active {
    border-bottom: solid map-get($theme-colors, 'primary') 2px;
    border-radius: 0 !important;
    background-color: rgba(map-get($theme-colors, 'primary'), 0.3);
  }
}

.fixed {
  z-index: 1 ! important;
  background: white !important;
  position: fixed;
}

</style>
