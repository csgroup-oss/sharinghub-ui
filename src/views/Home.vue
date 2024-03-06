<template>
  <div class="container pt-4">
    <div class="sm:block md:flex lg:flex xl:flex  justify-content-center mb-6">
      <b-row class="md:flex-row lg:flex-row ">
        <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6">
          <h1 class="mb-4"> {{ title }} community </h1>
          <h2 class="mb-3"> {{ config?.title }} </h2>
          <Description v-if="!loading" :description="config?.description" />
        </div>
        <div class="col-sm-12 col-md-12 col-lg-6 col-xl-6 sm:hidden md:hidden lg:inline xl:inline">
          <img height="350px" :src="image">
        </div>
      </b-row>
    </div>

    <div class="flex justify-content-center my-6 ">
      <div class="p-divider--horizontal w-50" />
    </div>

    <div class="w-100 flex justify-content-center flex-column align-items-center">
      <div v-for="(el, key) in categories" :key="key" class="mb-6  col-xl-7 col-lg-10 col-md-12 col-sm-12  ">
        <div class="w-100">
          <home-card v-bind="el" :index="key" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import image from '@/assets/img/illustre_1.svg';
import Description from '@/components/Description.vue';
import HomeCard from '@/_Hub/components/HomeCard.vue';
import '@/assets/base.scss';
import I18N from '@radiantearth/stac-fields/I18N';
import {loadMessages, translateFields} from '@/i18n';
import {mapState} from 'vuex';

export default defineComponent({
  name: 'Home',
  components: {HomeCard, Description},
  data() {
    return {
      image: image,
      loading: true,
      config: undefined,
      categories: []
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
        document.documentElement.setAttribute('lang', locale);
        this.setConfig(locale);
      }
    }
  },
  async created() {
    this.setConfig();

  },
  methods: {
    async setConfig(locale = 'en') {
      let entries = {};
      Object.entries(this.provideConfig?.categories).forEach(([category, values]) => {
        entries[category] = Object.assign({logo: values['logo']}, values['locales']);
      });
      this.categories = Object.entries(entries).map(([key, val]) => {
        return Object.assign({category: key, logo: val['logo']}, val[locale]);
      });
      this.config = this.provideConfig.root.locales[locale];
      this.loading = false;
    }

  }
});
</script>

<style scoped lang="scss">
@media screen and  (max-width:575px) {
  .sm\:hidden{
    border:solid 1px red !important;
    display: none !important;
  }
}
</style>
