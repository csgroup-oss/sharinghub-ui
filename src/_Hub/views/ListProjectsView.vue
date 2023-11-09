<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/tools/https";
import _ from "lodash";
import {STAC_ROOT_URL} from "@/_Hub/Endpoint";
import config from "../../config";


export default defineComponent({
  name: "ListProjectsView",
  components: {ItemCard, TextView},
  data() {
    return {
      loading: true,
      dataList: [],
      title: ""
    };
  },
  computed: {
    ...mapState(['data', 'auth']),
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        const matched = this.getEntryMatch();
        if (matched) {
          this.title = Object.values(matched)[0];
          this.dataList = [];
          this.dataList = await this.fetchStac();
        }
      }
    },
    auth: {
      immediate: true,
      async handler(data) {
        if (data?.user && data?.token) {
          this.dataList = await this.fetchStac();
        }
      }
    }
  },
  methods: {
    async fetchStac(url = STAC_ROOT_URL) {
      const data = await get(url).then((response) => response.data);
      const child = data.links?.filter((el) => el.rel === "child");
      const child_requests = child.map(async (el) => {
        return get(el.href).then((response) => {
          return response.data;
        });
      });
      const entry_models = await Promise.all(child_requests).then((res) => {
        return res;
      });
      let matched = this.getEntryMatch() ? Object.keys(this.getEntryMatch())[0] : undefined;
      if (!matched) throw new Error("entry is wrong configure");
      return _.flatten(entry_models
        .filter((stac) => stac.title === matched)
        .map((stac) => stac.links))
        .filter((stac) => stac.rel === "child");
    },
    getEntryMatch() {
      const routePath = this.$route.params.pathMatch;
      let matched = undefined;
      Object.entries(config.entriesRoot).forEach(([key, val]) => {
        if (val.toLowerCase() === routePath) {
          matched = {[key]: val};
        }
      });
      return matched;
    }
  },
  async beforeMount() {
    const url = this.$store.state.catalogUrl;
    if (url) {
      // this.modelList = await this.fetchStac(url); // TODO check if deconnect work
    }
  },

});


</script>


<template>
  <div class="w-100 container">
    <TextView type="Title-1"> List of {{ title }}</TextView>
    <div class="section">
      <ItemCard v-for="dataset in dataList" :metadata="dataset"/>
    </div>

  </div>
</template>

<style scoped lang="scss">
.section {
  width: 100%;
  display: grid;
  grid-template-columns: 48% 48%;
  grid-column-gap: 4%;

}
</style>
