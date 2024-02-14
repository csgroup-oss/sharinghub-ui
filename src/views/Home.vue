<script>
import {defineComponent} from 'vue';
import image from "@/assets/img/illustre_1.svg";
import Description from "@/components/Description.vue";
import HomeCard from "@/_Hub/components/HomeCard.vue";
import "@/assets/base.scss";
import I18N from "@radiantearth/stac-fields/I18N";
import {loadMessages, translateFields} from "@/i18n";
import {mapState} from "vuex";

export default defineComponent({
  name: "Home",
  components: {HomeCard, Description},
  data() {
    return {
      image: image,
      loading: true,
      config: undefined,
      categories: [],
    };
  },
  computed: {
    ...mapState(['uiLanguage', 'provideConfig', 'title'])
  },
  watch: {
    uiLanguage: {
      immediate: true,
      async handler(locale) {
        if (!locale) {
          return;
        }

        // Update stac-fields
        I18N.locales = [locale];
        I18N.translate = translateFields;

        // Load messages
        await loadMessages(locale);

        // Set the locale for vue-i18n
        this.$root.$i18n.locale = locale;

        // Update the HTML lang tag
        document.documentElement.setAttribute("lang", locale);
        this.setConfig(locale);
      }
    }
  },
  async created() {
    this.setConfig();

  },
  methods: {
    async setConfig(locale = "en") {
      let entries = {};
      Object.entries(this.provideConfig?.categories).forEach(([category, values]) => {
        entries[category] = Object.assign({logo: values['logo']}, values['locales']);
      });
      this.categories = Object.entries(entries).map(([key, val]) => {
        return Object.assign({category: key, logo: val['logo']}, val[locale]);
      });
      this.config = this.provideConfig.root.locales[locale];
      this.loading = false;
    },

  }
});
</script>

<template>

  <div class="container p-pt-4">
    <div class="p-d-flex p-justify-center p-mb-6">

      <b-row class="p-flex-md-row p-flex-lg-row ">
        <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6">
          <h1 class="p-mb-4"> {{ title }} community </h1>
          <h2 class="p-mb-3"> {{ config?.title }} </h2>
          <Description v-if="!loading" :description="config?.description"/>
        </div>
        <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6 p-d-sm-none p-d-md-none  p-d-xl-inline p-d-lg-inline">
          <img height="350px" :src="image"/>
        </div>
      </b-row>
    </div>

    <div class="p-d-flex p-justify-center p-my-6 ">
      <div class="p-divider--horizontal w-50"/>
    </div>

    <div class="w-100 p-d-flex p-justify-center p-flex-column p-ai-center">
      <div v-for="(el, key) in categories" :key="key" class="p-mb-6  col-xl-7 col-lg-10 col-md-12 col-sm-12  ">
        <div class="w-100">
          <home-card v-bind="el" :index="key"/>
        </div>
      </div>

    </div>


  </div>
</template>

<style scoped lang="scss">

</style>
