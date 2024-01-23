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
      tags: undefined,
      pagination: 1,
      filtered_tags: [],
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
        this.filtered_tags = [];
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
      return get(PROXY_URL.concat('tags')).then((response) => {
        if (response.data) {
          this.tags = response.data;
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

      if (this.filtered_tags.length !== 0) {
        searchUrl = this.addTopicsToUrl(searchUrl, this.filtered_tags);
      } else {
        if (topics) {
          this.addFilterTag(topics);
          searchUrl = this.addTopicsToUrl(searchUrl, this.filtered_tags);
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
        if (index !== topics.length - 1) {
          url = url.concat(`${topic},`);
        } else {
          url = url.concat(`${topic}`);
        }
      });
      return url;
    },
    addFilterTag(item) {
      if (!this.filtered_tags.includes(item)) {
        this.filtered_tags.push(item);
      } else {
        this.filtered_tags = this.filtered_tags.filter(el => el !== item);
        const {collections, topics} = this.$route.query;
        if (topics && collections) {
          const _collections = this.entriesRoute.map(el => el.route).join(",");
          this.$router.push({path: "", query: {collections: _collections}});
        }
      }
    },
    async handleFilterTag(item) {
      this.addFilterTag(item);
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
    },
    getCategory(stacFeatureItem) {
      return this.entriesRoute.find(el => el.route === stacFeatureItem.properties['sharinghub:category'])?.title;
    }
  },

});


</script>


<template>
  <div class="w-100 container">
    <text-view class="p-ml-5" type="header__b20"> {{ $t('fields.results') }}</text-view>

    <div class="section p-ml-5">
      <div class="col-xl-3 col-md-3 col-lg-3  col-sm-12 filter pt-5">
        <TagFilterComponent
            v-if="!!tags"
          :handle-filter-tags="handleFilterTag"
          :filtered-tags="filtered_tags"
          :tags="tags"
        />
      </div>
      <div class="col-xl-9 col-md-9 col-lg-9 col-sm-12 ">
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
            <item-card v-for="dataset in dataList" :stac="dataset" :category="getCategory(dataset)"/>
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

}
</style>
