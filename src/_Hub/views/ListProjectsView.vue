<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/tools/https";
import _ from "lodash";
import {STAC_ROOT_URL} from "@/_Hub/Endpoint";
import Awaiter from "@/_Hub/components/Awaiter.vue";


export default defineComponent({
  name: "ListProjectsView",
  components: {Awaiter, ItemCard, TextView},
  data() {
    return {
      dataList: [],
      title: "",
      loading: true
    };
  },
  computed: {
    ...mapState(['data', 'auth', 'entriesRoute', 'uiLanguage']),
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
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
    },
    entriesRoute: {
      immediate: true,
      async handler() {
        this.dataList = [];
        this.dataList = [...await this.fetchStac()];
      }
    }
  },
  methods: {
    async fetchStac(url = STAC_ROOT_URL) {
      this.loading = true;
      let route = this.$route.params.pathMatch;
      const data = await get(url).then((response) => response.data)
        .catch(() => {
          if (this.$route.name !== "Login") {
            this.$router.push("/login");
          }
        });
      const child = data.links?.filter((el) => el.rel === "child");
      const child_requests = child.map(async (el) => {
        return get(el.href).then((response) => {
          return response.data;
        });
      });
      const entry_models = await Promise.all(child_requests).then((res) => {
        return res;
      });
      const res = _.flatten(entry_models
        .filter((stac, idx) => {
          let boolean = route ? stac.id.includes(route) : idx === 0;
          if (boolean) {
            this.title = this.entriesRoute.find(el => el.route === route)?.title || this.entriesRoute[0].title;
            return true;
          }
          return false;
        }).map((stac) => stac.links)).filter((stac) => stac.rel === "child");
      this.loading = false;
      return res;
    },
  },

});


</script>


<template>
  <div class="w-100 container">
    <text-view class="p-ml-5" type="header__b20"> {{ $t('fields.list_of', [title]) }}</text-view>
    <template v-if="loading">

      <awaiter :is-visible="loading"/>
    </template>
    <div v-else class="section">

      <template v-if="dataList.length !== 0">
        <b-col cols="3" v-for="dataset in dataList">
          <item-card :metadata="dataset"/>
        </b-col>
      </template>
      <h3 class="p-mt-6" v-else> {{ $t('fields.no_data_found') }}</h3>
    </div>


  </div>
</template>

<style scoped lang="scss">
.section {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  //display: grid;
  //grid-template-columns: 48% 48%;
  //grid-column-gap: 4%;

}
</style>
