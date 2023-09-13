<template>
  <div class="p-flex-column h-100 w-100 border-grey p-m">
    <header-navbar />
  </div>
</template>


<script>
import {defineComponent} from 'vue';
import HeaderNavbar from "@/_Hub/components/HeaderNavbar.vue";

export default defineComponent({
  name: "MainPage",
  components: {
    HeaderNavbar,
  }
});

</script>


<style scoped lang="scss">

</style>