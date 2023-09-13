<template>
  <div class="container w-100 p-px-4 p-py-2 p-d-flex p-ai-center p-jc-between border-rose">
    <div class="p-d-flex p-ai-center">
      <text-view class="p-mr-4">SharingHUB</text-view>
      <div class="p-input-icon-left">
        <i class="pi pi-search" />
        <input-text class="p-inputtext-sm" type="text" v-model="value" placeholder="Search services, models, users..." />
      </div>
    </div>
    <div>
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import InputText from 'primevue/inputtext';
import TextView from "@/_Hub/components/TextView.vue";

export default defineComponent({
  name: "HeaderNavbar",
  components: {
    TextView,
    InputText
  },
  data() {
    return {
      value:null,
    };
  },

});
</script>

<style scoped lang="scss">

</style>