<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapGetters, mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/services/https";
import _ from "lodash";
import ErrorAlert from "@/components/ErrorAlert.vue";
import Utils, {BrowserError} from "@/utils";

const ENTRY = {
  models: "AI Model",
  dataset: "Dataset",
  processor: "Processor",
};

export default defineComponent({
  name: "ListModelView",
  components: {ErrorAlert, ItemCard, TextView},
  data() {
    return {
      loading: true,
      modelList: [],
      url: undefined,
      errorId: 401,
      errorDescription: ""
    };
  },
  computed: {
    ...mapState(['data']),
  },
  async created() {
    const url = this.$store.state.catalogUrl
    this.url = this.$store.state.catalogUrl
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
    this.modelList = _.flatten(entry_models
      .filter((stac) => stac.title === ENTRY.models)
      .map((stac) => stac.links))
      .filter((stac) => stac.rel === "child");
  },
  methods: {

  },
});


</script>


<template>
  <div class="w-100 container">
    <TextView type="Title-1">Model List</TextView>

    <div class="section">
      <ItemCard  v-for="model in modelList" :metadata="model"/>
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
