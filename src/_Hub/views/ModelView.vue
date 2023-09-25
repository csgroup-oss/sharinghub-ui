<template>
  <div class="p-d-flex w-100 border-ro container p-px-4">
    <div class="p-d-flex p-flex-column w-100">
      <div class="p-d-flex p-ai-center p-pb-3">
        <tag-custom icon="pi pi-heart" label="likes" sub-label="403"/>
      </div>
      <!--   chips section    -->
      <div class="w-100 p-d-flex p-ai-center p-flex-wrap">
        <chip v-for="tag in tags" :label="tag.label" :icon="'pi '+ tag.icon "
              :class="'p-chip p-chip__' + getRandomColor()" />
      </div>


      <div class="w-100 p-pt-5 ">
        <b-tabs class="p-pb-3">

          <b-tab class="p-pt-4">
            <template #title>
              <TextView class="Title-2"> Asset Card</TextView>
            </template>
            <TextView>
              <AssetCard/>
            </TextView>
          </b-tab>

          <b-tab class="p-pt-4">
            <template #title>
              <TextView class="Title-1"> Reviews community</TextView>
            </template>
            <TextView>
              <ReviewSection/>
            </TextView>
          </b-tab>

          <b-tab class="p-pt-4">
            <template #title>
              <TextView class="Title-1"> File and versions</TextView>
            </template>
            <TextView>
              <p> Hello Tab 1</p>
            </TextView>
          </b-tab>

          <b-tab class="p-pt-4">
            <template #title>
              <TextView class="Title-1">STAC Api</TextView>
            </template>
            <TextView>
              <p> Hello Tab 1</p>
            </TextView>
          </b-tab>

        </b-tabs>

      </div>

    </div>
  </div>
</template>
<script>
import Vue, {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import _ from "lodash";
import Chip from "primevue/chip/Chip";
import TagCustom from "@/_Hub/components/TagCustom.vue";
import AssetCard from "@/_Hub/views/sections/AssetCard.vue";
import BootstrapVue, {BTab, BTabs} from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import ReviewSection from "@/_Hub/views/sections/ReviewSection.vue";

Vue.use(BootstrapVue);


export default defineComponent({
  name: "ModelView",
  components: {ReviewSection, AssetCard, TagCustom, TextView, Chip, BTabs, BTab},
  data() {
    return {
      tags: [
        {label: "Text generation", icon: "pi-file-edit"},
        {label: "SkykitLean", icon: "pi-github"},
        {label: "English", icon: "pi-globe"},
        {label: "DOI:2308.145", icon: "pi-book"},
        {label: "License: MIT", icon: "pi-check"},
      ],
    };
  },
  methods: {
    getRandomColor: function () {
      return _.sample(["info", "outline", "purple", "danger", "red", "darkgrey", "primary"]);
    }
  }
});
</script>


<style scoped lang="scss">
@import "src/assets/colors";
@import "src/assets/mixins";

.hide {
  display: none !important;
}

.p-chip {
  font-size: 0.7em !important;
  border-radius: 0.5rem !important;
  background: transparent;
  max-width: 300px;
  text-overflow: ellipsis;
  text-wrap: normal;
  overflow: hidden;
  cursor: pointer;
  margin: 0 3px;

  &__outline {
    border: 1px rgba($primary-color, 0.5) solid;

    :hover {
      color: $primary-color;
      transition: color ease-in-out 0.2ms;
    }
  }

  &__info {
    @include fade_background($info)
  }

  &__primary {
    @include fade_background($primary-color)
  }

  &__danger {
    @include fade_background($danger)
  }

  &__red {
    @include fade_background($red)
  }

  &__darkgrey {
    @include fade_background($dark-grey)
  }

  &__purple {
    @include fade_background($purple)
  }
}
</style>
