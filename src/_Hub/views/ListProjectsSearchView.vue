<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/tools/https";
import {PROXY_URL, STAC_SEARCH} from "@/_Hub/Endpoint";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import _ from "lodash";
import TagFilterComponent from "@/_Hub/components/TagFilterComponent.vue";


export default defineComponent({
  name: "ListProjectsSearchView",
  components: {TagFilterComponent, Awaiter, ItemCard, TextView},
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
    keywordSearched() {
      return this.$route.query?.q;
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler() {
        this.filtered_topic = [];
        this.dataList = [];
        this.dataList = [...await this.fetchCollectionsItems()];
      }
    },
    entriesRoute: {
      immediate: true,
      async handler(newVal, oldValue) {
        if (oldValue?.length > 0 && !_.isEqual(newVal, oldValue)) {
          this.dataList = [];
          this.dataList = [...await this.fetchCollectionsItems()];
        }
      }
    },
  },
  async beforeMount() {
    this.getTopics();
  },
  methods: {
    async getTopics() {
      return get(PROXY_URL.concat('topics')).then((response) => {
        if (response.data) {
          this.topics = response.data;
        }
        return response.data;
      }).catch(() => {
      });
    },

    async fetchCollectionsItems(url = STAC_SEARCH) {
      this.loading = true;
      let results = [];
      let {page, q, topics, collections} = this.$route.query;
      // let route = this.$route.params.pathMatch;
      let searchUrl = url.concat(`?collections=${collections}&page=${page || 1}`);

      if (this.filtered_topic.length !== 0) {
        searchUrl = this.addTopicsToUrl(searchUrl, this.filtered_topic);
      } else {
        if (topics) {
          this.addFilterTopic({name: topics});
          searchUrl = this.addTopicsToUrl(searchUrl, this.filtered_topic);
        }
      }
      if (q) {
        searchUrl = this.addQueryToUrl(searchUrl, q);
      }

      const data = await get(searchUrl).then((response) => {
        this.pagination = Math.ceil(response.data.context.matched / response.data.context.limit);
        this.pagination = this.pagination > 1 ? this.pagination : 1;
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

    addQueryToUrl(_url, q) {
      return _url.concat(`&q=${q}`);
    },
    addTopicsToUrl(_url, topics = []) {
      let url = _url.concat(`&topics=`);
      topics.forEach((topic, index) => {
        if (index !== this.topics.length - 1) {
          url = url.concat(`${topic.name},`);
        } else {
          url = url.concat(`${topic.name}`);
        }
      });
      return url;
    },


    addFilterTopic(item) {
      if (!this.filtered_topic.some(el => el.name === item.name)) {
        this.filtered_topic.push(item);
      } else {
        this.filtered_topic = this.filtered_topic.filter(el => el.name !== item.name);
        const {collections, topics} = this.$route.query;
        if (topics && collections) {
          const _collections = this.entriesRoute.map(el => el.route).join(",");
          this.$router.push({path: "", query: {collections: _collections}});
        }

      }
    },
    async handleFilterTopic(item) {
      this.addFilterTopic(item);
      this.dataList = [];
      this.dataList = [...await this.fetchCollectionsItems()];

    },
    linkGen(pageNum) {
      return pageNum === 1 ? '?' : `?page=${pageNum}`;
    },
    handleResetKeywordCriteriaSearch() {
      const {topics, collections} = this.$route.query;
      let _query = {};
      if (topics) {
        _query = {topics};
      }
      if (collections) {
        _query = {..._query, collections};
      }
      this.$router.push({path: "", query: {..._query}});
    }
  },

});


</script>


<template>
  <div class="w-100 container">
    <text-view class="p-ml-5" type="header__b20"> {{ $t('fields.results') }}</text-view>

    <div class="section p-ml-5">
      <div class="col-xl-2 col-md-3 col-lg-2  col-sm-12 filter pt-5">
        <TagFilterComponent
          :handle-filter-topic="handleFilterTopic"
          :filtered-topic="filtered_topic"
          :topics="topics"
        />
      </div>
      <div class="col-xl-10 col-md-9 col-lg-10 col-sm-12 ">
        <template v-if="loading">
          <awaiter :is-visible="loading"/>
        </template>
        <template v-else>

          <b-row v-if="!!keywordSearched" class="p-d-flex p-flex-wrap p-ai-baseline p-pl-5">
            <TextView type="header__b20" class="text-primary"> {{ $t("fields.keyword_search", [keywordSearched]) }} :
            </TextView>
            <b-badge @click="handleResetKeywordCriteriaSearch" variant="secondary" class="cursor p-ml-5 p-px-2"
                     size="lg"> {{ $t("reset") }}
              <b-icon-arrow-repeat/>
            </b-badge>
          </b-row>

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
