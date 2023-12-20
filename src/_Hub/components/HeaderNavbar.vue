<template>
  <header class="nav-bar w-100 p-pb-2">
    <div class="container p-px-4 p-py-1 p-d-flex p-ai-center p-jc-between">
      <div class="p-d-flex p-ai-center">
        <text-view class="p-mr-4">
          <router-link to="/" class="cursor">
            SharingHUB
          </router-link>
        </text-view>
        <div class="">
          <b-input-group size="md" class="100">
            <b-form-input type="text" v-model="value" @keyup.enter="handleEnter()"
                          :placeholder="$t('fields.search_placeholder') ">
            </b-form-input>
            <b-input-group-prepend is-text>
              <b-icon icon="search"/>
            </b-input-group-prepend>
          </b-input-group>
        </div>
      </div>

      <div class="p-d-flex p-ai-center p-jc-between">
        <template v-if="routes.length > 0">
          <nav-item v-for="item in routes" class="p-mx-1">
            <b-icon :icon="item.icon"/>
            <router-link :to="`/${item.route}`">
              {{ item.title }}
            </router-link>
          </nav-item>
          <nav-item disabled class="p-mx-1">
            Docs
          </nav-item>
        </template>
        <div class="p-divider--vertical"/>

        <div class="p-d-flex p-ai-center">
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
import {LOGIN_URL, LOGOUT_URL, PROXY_URL} from "@/_Hub/Endpoint";
import {mapState} from "vuex";
import {get, removeLocalToken, CONNEXION_MODE} from "@/_Hub/tools/https";
import Localisation from "@/components/Localisation.vue";


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
      avatar_url: undefined
    };
  },
  computed: {
    ...mapState(['auth', 'catalogUrl', 'title', 'data', 'url']),
    login() {
      return LOGIN_URL;
    },
  },
  watch: {
    auth: {
      immediate: true,
      async handler(data) {
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
    },
  },
  methods: {
    async logout() {
      get(LOGOUT_URL).then((response) => {
        if (response) {
          const auth = {...this.auth, mode : CONNEXION_MODE.DEFAULT_TOKEN, user:null };
          this.$store.commit("setUserInfo", auth);
        }
      });
    },
    handleEnter() {
      if (this.value && this.$route.name !== "search") {
        this.$router.push(
          {
            path: `/search/external/${this.catalogUrl}`,
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

.nav-bar {
  border-bottom: rgba($secondary-color, 0.05) 2px solid;

  .p-divider {
    border-left: solid 1px rgba($secondary-color, 0.4);
  }

  .cursor {
    &:hover {
      text-decoration: none !important;
      text-underline: none !important;
    }
  }
}


</style>
