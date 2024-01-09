<script>
import {defineComponent} from 'vue';
import image from "@/assets/img/illustre_1.svg";
import {CONFIG_URL} from "@/_Hub/Endpoint";
import {get} from "@/_Hub/tools/https";
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
  computed:{
    ...mapState(['uiLanguage'])
  },
  watch:{
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
        this.getConfig(locale);
      }
    }
  },
  async created() {
    this.getConfig();

  },
  methods: {
    async getConfig(locale = "en") {
      get(CONFIG_URL).then((response) => {
        if (response.data) {
          let entries = {};
          Object.entries(response.data?.categories).forEach(([category, values]) => {
            entries[category] = Object.assign({logo: values['logo']}, values['locales']);
          });
          this.categories = Object.entries(entries).map(([key, val]) => {
            return Object.assign({category: key, logo: val['logo']}, val[locale]);
          });
          this.config =response.data.root.locales[locale];
          this.loading = false;
        }
      });
    },

  }
});
</script>

<template>

  <div class="container p-pt-4">
    <div class="p-d-flex p-justify-center p-mb-6">
      <div class="p-d-flex p-justify-between p-ai-baseline" style="width: 65%">
        <div>
          <h1 class="p-mb-4"> SharingHUB community </h1>
          <h2 class="p-mb-3"> {{ config?.title }} </h2>
          <Description v-if="!loading" :description="config?.description"/>
        </div>
        <div>
          <img height="350px" :src="image"/>
        </div>
      </div>
    </div>
    <div class="p-d-flex p-justify-center p-my-6 ">
      <div class="p-divider--horizontal w-50"/>
    </div>

    <div class="w-100 p-d-flex p-justify-center p-flex-column p-ai-center">
      <div v-for="(el, key) in categories" :key="key" class="p-mb-6 w-60">
        <div class="w-100">
          <home-card v-bind="el" :index="key"/>
        </div>
      </div>

    </div>


  </div>
</template>

<style scoped lang="scss">

</style>
