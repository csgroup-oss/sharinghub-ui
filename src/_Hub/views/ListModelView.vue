<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import ResourceCard from "@/_Hub/components/ResourceCard.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/services/https";
import _ from "lodash";

const ENTRY = {
  models: "AI Model",
  dataset: "Dataset",
  processor: "Processor",
};

export default defineComponent({
  name: "ListModelView",
  components: {ItemCard, TextView},
  data() {
    return {
      loading: true,
      modelList: []
    };
  },
  computed: {
    ...mapState(['data'])
  },
  async created() {
    const basURL = "https://gistac.p2.csgroup.space/gitlab.si.c-s.fr/PhVBrbXSWzkBtJwtr_sK/";
    await this.$store.dispatch('load', {url: basURL, loadApi: true, show: true});
    const child = this.data.links.filter((el) => el.rel === "child");
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
      .filter((stac)=> stac.rel ==="child");
  },
  methods: {
    async getModels() {
    },
  },
});


</script>


<template>
  <div class="w-100 container">
    <TextView type="Title-1">Model List</TextView>

    <div class="section">
      <ItemCard
        v-for="model in modelList" :metadata="model"/>
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
