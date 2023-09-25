<template>
  <div class="p-d-flex p-flex-column h-100 w-100 p-ai-center main-page p-jc-between">
    <header-navbar />
    <div class="w-100 h-100 p-pt-6">
       <router-view/>
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
import {defineComponent} from 'vue';
import HeaderNavbar from "@/_Hub/components/HeaderNavbar.vue";
import TextView from "@/_Hub/components/TextView.vue";
import ModelView from "@/_Hub/views/ModelView.vue";
import "./assets/base.scss";

export default defineComponent({
  name: "MainPage",
  components: {
    ModelView,
    TextView,
    HeaderNavbar,
  }
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
