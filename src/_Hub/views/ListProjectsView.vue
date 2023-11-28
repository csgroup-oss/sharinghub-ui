<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/tools/https";
import _ from "lodash";
import {STAC_ROOT_URL} from "@/_Hub/Endpoint";


export default defineComponent({
  name: "ListProjectsView",
  components: {ItemCard, TextView},
  data() {
    return {
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
      async handler(old, from) {
        this.dataList = [];
        this.dataList = [...await this.fetchStac()];
      }
    },
    auth: {
      immediate: true,
      async handler(data) {
        if (data?.user) {
          this.dataList = await this.fetchStac();
        }
      }
    }
  },
  methods: {
    async fetchStac(url = STAC_ROOT_URL) {
      let route = this.$route.params.pathMatch;
      route = route ?  route.split("-").join(" ") : null;
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
      return _.flatten(entry_models
        .filter((stac, idx) => {
          let boolean = route ? stac.title.toLowerCase() === route : idx === 0;
          if (boolean) {
            this.title = stac.title;
            return true;
          }
        }).map((stac) => stac.links))
        .filter((stac) => stac.rel === "child");
    },
  },

});


</script>


<template>
  <div class="w-100 container">
    <TextView type="Title-1"> {{ $t('fields.list_of' , [title]) }} </TextView>
    <div class="section">
      <ItemCard v-for="dataset in dataList" :metadata="dataset" />
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
