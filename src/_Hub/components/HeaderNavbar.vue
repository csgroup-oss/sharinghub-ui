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
          <input-text disabled class="p-inputtext-sm" type="text" v-model="value"
                      placeholder="Search services, models, users..."/>
        </div>
      </div>

      <div v-if="routes.length > 0" class="p-d-flex p-ai-center p-jc-between">

        <nav-item v-for="item in routes" class="p-mx-1">
          <b-icon :icon="item.icon"/>
          <router-link :to="`/${item.route.toLowerCase()}`">
           {{item.route}}
          </router-link>
        </nav-item>

        <nav-item icon="pi pi-book" disabled class="p-mx-1">Docs</nav-item>

        <divider class="p-divider" type="solid" layout="vertical"></divider>
        <nav-item disabled="" :is-simple="true" class="p-ml-1 p-mr-4">Log In</nav-item>
        <Button disabled class=" p-button-sm p-button-info"> Sign Up</Button>
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
      value: null,
      routes: []
    };
  },
  beforeMount() {
    if (config?.entriesRoot) {
      this.routes = Object.values(config.entriesRoot).map((entry) => {
        if (entry.toLowerCase() === "processors") {
          return {
            route: entry,
            icon: "book",
          }
        }
        if (entry.toLowerCase() === "models") {
          return {
            route: entry,
            icon: "box-seam",
          }
        }
        if (entry.toLowerCase() === "datasets") {
          return {
            route: entry,
            icon: "view-list",
          }
        }
        return {
          route: entry,
          icon: "stack",
        }
      })
    }
  }

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
