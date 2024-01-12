<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/tools/https";
import _ from "lodash";
import {CONFIG_URL, PROXY_URL, STAC_ROOT_URL} from "@/_Hub/Endpoint";
import Awaiter from "@/_Hub/components/Awaiter.vue";


export default defineComponent({
  name: "ListProjectsView",
  components: {Awaiter, ItemCard, TextView},
  data() {
    return {
      dataList: [],
      title: "",
      loading: true,
      topics: [],
      filtered_topic: [],
      default_preview: undefined
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
  beforeMount() {
    this.getTopics();
  },
  methods: {
    async getConfig(url = CONFIG_URL) {
      get(url).then((response) => {
        if (response.data) {
          let entries = {};
          Object.entries(response.data?.categories).forEach(([topic, values]) => {
            entries[topic] = Object.assign({logo: values['logo']});
          });
          const topic = Object.entries(entries).map(([key, val]) => {
            return Object.assign({topic: key, logo: val['logo']});
          });
          this.default_preview = topic.find(el => el.topic === this.$route.params.pathMatch)?.logo;
        }
      });

    },
    async fetchStac(url = STAC_ROOT_URL) {
      this.loading = true;
      await this.getConfig();
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
    async getTopics() {
      get(PROXY_URL.concat('/topics')).then((response) => {
        if (response.data) {
          this.topics = response.data;
        }
      });
    },

    filterTopicWith(item) {
      if (!this.filtered_topic.includes(item)) {
        this.filtered_topic.push(item);
      } else {
        this.filtered_topic = this.filtered_topic.filter(el => el !== item);
      }
    }
  },

});


</script>


<template>
  <div class="w-100 container">
    <text-view class="p-ml-5" type="header__b20"> {{ $t('fields.list_of', [title]) }}</text-view>
    <template v-if="loading">

      <awaiter :is-visible="loading" />
    </template>
    <div v-else class="section p-ml-5">
      <div class="col-xl-2 col-md-2 col-lg-2  col-sm-12 filter pt-5">
        <div class="p-d-flex p-flex-wrap p-ai-center ">
          <b-badge v-for="topic in topics" variant="light" pill
                   @click="filterTopicWith(topic)"
                   :class="['m-1 cursor p-2', filtered_topic.includes(topic) && 'active']" >
            {{ topic.title }}
          </b-badge>
        </div>
      </div>
      <div class="col-xl-10 col-md-10 col-lg-10 col-sm-12 " v-if="dataList.length !== 0">
        <b-row class="p-d-flex p-flex-wrap p-ai-center">
          <item-card :default-preview="default_preview" v-for="dataset in dataList" :metadata="dataset"/>
        </b-row>
      </div>
      <h3 class="p-mt-6" v-else> {{ $t('fields.no_data_found') }}</h3>
    </div>


  </div>
</template>

<style scoped lang="scss">
@import "../../assets/colors";
@import "../../theme/variables";

.section {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .badge {
    //background-color: rgba($secondary-color,1) !important;
    border: 1px rgba($secondary-color, 1) solid;
  }


  .filter {
    width: 100%;
    //border-right: 2px red solid;
    border-radius: 12px;
    background: red;
    background: linear-gradient(90deg, #FFFFFF, rgba(#129E83, 0.032));

    .active {
      color: #FFFFFF;
      background-color: map-get($theme-colors, "primary") !important;
    }
  }
}
</style>
