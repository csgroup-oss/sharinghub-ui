<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/tools/https";
import {PROXY_URL, STAC_SEARCH} from "@/_Hub/Endpoint";
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
      pagination: 1,
      filtered_topic: [],
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
        this.dataList = [...await this.fetchCollectionsItems()];
      }
    },
    auth: {
      immediate: true,
      async handler(data) {
        if (data?.user) {
          this.dataList = await this.fetchCollectionsItems();
        }
      }
    },
    entriesRoute: {
      immediate: true,
      async handler() {
        this.dataList = [];
        this.dataList = [...await this.fetchCollectionsItems()];
      }
    },
    filtered_topic: {
      immediate: true,
      async handler(newVal, oldVal) {
        if (newVal.length === 0 && !oldVal) {
          return;
        }
        this.dataList = [];
        this.dataList = [...await this.fetchCollectionsItems()];

      }
    }
  },
  beforeMount() {
    this.getTopics();
  },
  methods: {
    async fetchCollectionsItems(url = STAC_SEARCH) {
      this.loading = true;
      let results = [];
      let {page} = this.$route.query;
      page = page || 1;
      let route = this.$route.params.pathMatch;
      this.title = this.entriesRoute.find(el => el.route === route)?.title || this.entriesRoute[0].title;
      url = url.concat(`?collections=${route}&page=${page}`);
      if (this.filtered_topic.length !== 0) {
        url = url.concat(`&topics=`);
        this.filtered_topic.forEach((topic, index) => {
          if (index !== this.filtered_topic.length - 1) {
            url = url.concat(`${topic.name},`);
          } else {
            url = url.concat(`${topic.name}`);
          }
        });
      }
      const data = await get(url).then((response) => {
        this.pagination = Math.ceil(response.data.context.matched / response.data.context.limit);
        this.pagination  = this.pagination > 1 ? this.pagination : 1;
        return response.data;
      })
        .catch(() => {
          if (this.$route.name !== "Login") {
            this.$router.push("/login");
          }
        });
      results = data?.features || [];
      this.loading = false;
      return results;
    },
    async getTopics() {
      get(PROXY_URL.concat('topics')).then((response) => {
        if (response.data) {
          this.topics = response.data;
        }
      }).catch(() => {
      });
    },
    filterTopicWith(item) {
      if (!this.filtered_topic.includes(item)) {
        this.filtered_topic.push(item);
      } else {
        this.filtered_topic = this.filtered_topic.filter(el => el !== item);
      }
    },
    linkGen(pageNum) {
      return pageNum === 1 ? '?' : `?page=${pageNum}`;
    }
  },

});


</script>


<template>
  <div class="w-100 container">
    <text-view class="p-ml-5" type="header__b20"> {{ $t('fields.list_of', [title]) }}</text-view>

    <div class="section p-ml-5">
      <div class="col-xl-2 col-md-3 col-lg-2  col-sm-12 filter pt-5">
        <div class="p-d-flex p-flex-wrap p-ai-center ">
          <b-badge v-for="topic in topics" variant="light" pill
                   @click="filterTopicWith(topic)"
                   :class="['m-1 cursor p-2', filtered_topic.includes(topic) && 'active']">
            {{ topic.title }}
          </b-badge>
        </div>
      </div>
      <div class="col-xl-10 col-md-9 col-lg-10 col-sm-12 ">
        <template v-if="loading">
          <awaiter :is-visible="loading"/>
        </template>
        <template v-else>
          <b-row v-if="dataList.length !== 0" class="p-d-flex p-flex-wrap p-ai-center">
            <item-card v-for="dataset in dataList" :stac="dataset"/>
          </b-row>
          <h3 class="p-mt-6" v-else> {{ $t('fields.no_data_found') }}</h3>
          <b-row class="p-d-flex p-flex-wrap  p-jc-center">
            <div class="overflow-auto mt-3">
              <b-pagination-nav :link-gen="linkGen" :number-of-pages="pagination" use-router></b-pagination-nav>
            </div>
          </b-row>

        </template>

      </div>

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
