<template>
  <header class="nav-bar w-100 p-pb-2">
    <div class="container p-px-4 p-py-1 p-d-flex p-ai-center p-jc-between">
      <div class="p-d-flex p-ai-center">
        <text-view class="p-mr-4">SharingHUB</text-view>
        <div class="p-input-icon-left">
          <i class="pi pi-search"/>
          <input-text class="p-inputtext-sm" type="text" v-model="value"
                      placeholder="Search services, models, users..."/>
        </div>
      </div>
      <div class="p-d-flex p-ai-center p-jc-between">
        <nav-item icon="pi pi-th-large" class="p-mx-1">
          <router-link to="/model/id">
            App and service
          </router-link>
        </nav-item>


        <nav-item icon="pi pi-box" class="p-mx-1">
          <router-link to="/models">
            Models
          </router-link>
        </nav-item>


        <nav-item icon="pi pi-database" class="p-mx-1">Datasets</nav-item>
        <nav-item icon="pi pi-book" class="p-mx-1">Docs</nav-item>
        <divider class="p-divider" type="solid" layout="vertical"></divider>
        <nav-item :is-simple="true" class="p-ml-1 p-mr-4">Log In</nav-item>
        <Button class=" p-button-sm p-button-info"> Sign Up</Button>
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
    };
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
}


</style>
