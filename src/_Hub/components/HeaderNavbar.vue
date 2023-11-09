<template>
  <header class="nav-bar w-100 p-pb-2">
    <div class="container p-px-4 p-py-1 p-d-flex p-ai-center p-jc-between">
      <div class="p-d-flex p-ai-center">
        <text-view class="p-mr-4">
          <router-link to="/" class="cursor">
            SharingHUB
          </router-link>
        </text-view>
        <div class="p-input-icon-left">
          <i class="pi pi-search"/>
          <input-text
            disabled class="p-inputtext-sm" type="text" v-model="value"
            placeholder="Search services, models, users..."
          />
        </div>
      </div>

      <div class="p-d-flex p-ai-center p-jc-between">
        <template v-if="isAuthenticated && routes.length > 0">
          <nav-item v-for="item in routes" class="p-mx-1">
            <b-icon :icon="item.icon"/>
            <router-link :to="`/${item.route.toLowerCase()}`">
              {{ item.route }}
            </router-link>
          </nav-item>

          <nav-item v-if="isAuthenticated" icon="pi pi-book" disabled class="p-mx-1">Docs</nav-item>
        </template>
        <divider class="p-divider" type="solid" layout="vertical"/>
        <a v-if="!isAuthenticated" :href="login">
          <Button :href="login" class=" p-button-sm p-button-info">
            Log In
          </Button>
        </a>
        <div v-if="auth">
          <b-dropdown size="lg" variant="link" toggle-class="text-decoration-none" no-caret>
            <template #button-content>
              <b-avatar size="40" variant="info" :src="auth?.user?.picture"/>
            </template>
            <b-dropdown-item @click="logout" href="#">Logout</b-dropdown-item>
            <b-dropdown-divider/>
          </b-dropdown>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import {defineComponent} from 'vue';
import InputText from 'primevue/inputtext';
import Divider from "primevue/divider/Divider";
import Button from "primevue/button/Button";
import TextView from "@/_Hub/components/TextView.vue";
import NavItem from "@/_Hub/components/HeaderNavbar/NavItem.vue";
import {LOGIN_URL, LOGOUT_URL, STAC_ROOT_URL} from "@/_Hub/Endpoint";
import {mapState} from "vuex";
import {get} from "@/_Hub/tools/https";
import config from "../../../config";

export default defineComponent({
  name: "HeaderNavbar",
  components: {
    NavItem,
    TextView,
    InputText,
    Divider,
    Button
  },
  data() {
    return {
      isAuthenticated: false,
      isLoading: false,
      value: null,
      routes: []
    };
  },
  computed: {
    ...mapState(['auth']),
    login() {
      return LOGIN_URL();
    },
  },
  watch: {
    $route: {
      immediate: true,
      async handler(route) {
        if (route.fullPath === "/") {
          this.isAuthenticated = false;
        } else {
          this.isAuthenticated = await this.isAuthorizedToFetch();
          if (!this.isLoading) {
            const entries = await this.fetchBaseStacEntries();
            this.routes = entries.map((entry) => {
              if (entry.title.toLowerCase() === ("processor")) {
                return {
                  route: config.entriesRoot[entry.title],
                  description: entry.description,
                  icon: "book",
                };
              }
              if (entry.title.toLowerCase().includes("model")) {
                return {
                  route: config.entriesRoot[entry.title],
                  description: entry.description,
                  icon: "box-seam",
                };
              }
              if (entry.title.toLowerCase().includes("dataset")) {
                return {
                  route: config.entriesRoot[entry.title],
                  description: entry.description,
                  icon: "view-list",
                };
              }
              return {
                route: config.entriesRoot[entry.title],
                description: entry.description,
                icon: "stack",
              };
            });
            this.isLoading = true;
          }
        }
      }
    },
    auth: {
      immediate: true,
      async handler(data) {
        this.isAuthenticated = !!(data?.user && data?.token);
      }
    }
  },
  async mounted() {
  },
  methods: {
    async isAuthorizedToFetch() {
      return get(STAC_ROOT_URL).then(
        async (response) => {
          if (response.data) {
            const stacRoot = response.data;
            const children = stacRoot.links?.filter((el) => el.rel === "child");
            const children_requests = children.map(async (el) => {
              return get(el.href).then((response) => {
                return response.data;
              });
            });
            return await Promise.allSettled(children_requests).then((results) => {
              return results.map(el => el.status).reduce((ac, nex) => nex === "fulfilled", false);
            });
          } else {
            return false;
          }
        });
    },
    async fetchBaseStacEntries(url = STAC_ROOT_URL) {
      return get(url).then(
        async (response) => {
          if (response.data) {
            const stacRoot = response.data;
            const children = stacRoot.links?.filter((el) => el.rel === "child");
            const children_requests = children.map(async (el) => {
              return get(el.href).then((response) => {
                return response.data;
              });
            });
            return await Promise.all(children_requests).then((results) => {
              return results;
            });
          } else {
            return [];
          }
        });
    },
    async logout() {
      get(LOGOUT_URL()).then((response) => {
        if (response) {
          this.$store.commit("setUserInfo", null);
        }
      });
    }
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
