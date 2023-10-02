<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {BASE_URL, get} from "@/_Hub/services/https";
import _ from "lodash";

const ENTRY = {
  models: "AI Model",
  dataset: "Dataset",
  processor: "Processor",
};

export default defineComponent({
  name: "ListDatasetView",
  components: {ItemCard, TextView},
  data() {
    return {
      loading: true,
      datasetList: []
    };
  },
  computed: {
    ...mapState(['data'])
  },
  async created() {
    const url = this.$store.state.catalogUrl
    if (!url) {
      this.$router.push("/")
    }
    await this.$store.dispatch('load', {url: url, loadApi: true, show: true});
    const child = this.data.links?.filter((el) => el.rel === "child");
    const child_requests = child.map(async (el) => {
      return get(el.href).then((response) => {
        return response.data;
      });
    });
    const entry_models = await Promise.all(child_requests).then((res) => {
      return res;
    });
    this.datasetList = _.flatten(entry_models
      .filter((stac) => stac.title === ENTRY.dataset)
      .map((stac) => stac.links))
      .filter((stac) => stac.rel === "child");
  },
  methods: {
    async getModels() {
    },
  },
});


</script>


<template>
  <div class="w-100 container">
    <TextView type="Title-1">Dataset List</TextView>

    <div class="section">
      <ItemCard
        v-for="dataset in datasetList" :metadata="dataset"/>
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
