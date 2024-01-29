<script>
import {computed, defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {mapState} from "vuex";
import ItemCard from "@/_Hub/components/ItemCard.vue";
import {get} from "@/_Hub/tools/https";
import {PROXY_URL, STAC_SEARCH} from "@/_Hub/Endpoint";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import _ from "lodash";
import TagFilterComponent from "@/_Hub/components/TagFilterComponent.vue";


export default defineComponent({
  name: "ListProjectsView",
  components: {TagFilterComponent, Awaiter, ItemCard, TextView},
  data() {
    return {
      dataList: [],
      title: "",
      loading: true,
      tags: undefined,
      pagination: 1,
      filtered_tags: [],
      next_link: undefined,
      over_loading: false,
      term_filter: null,
      nameSearchTimeout: null,
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
    computed,
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
      let {q, topics} = this.$route.query;
      let route = this.$route.params.pathMatch;
      const topic = this.entriesRoute.find(el => el.route === route);
      this.title = this.$t('fields.list_of', [topic.title]) || " ";

      let searchUrl = url.concat(`?collections=${route}&limit=30`);

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

      return get(searchUrl).then((response) => {
        if (response.data) {
          const {features, links} = response.data;
          this.next_link = links.find(el => el.rel === "next")?.href;
          this.loading = false;
          return features || [];
        } else {
          this.next_link = undefined;
          return [];
        }

      }).catch(() => {
        if (this.$route.name !== "Login") {
          this.$router.push("/login");
        }
      });
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
        const {topics, q} = this.$route.query;
        if (q) {
          this.$router.push({path: ""});
        } else if (topics) {
          this.$router.push({path: ""});
        }

      }
    },

    async handleFilterTag(item) {
      this.addFilterTag(item);
      this.dataList = [];
      this.dataList = [...await this.fetchCollectionsItems()];
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

    async loadItemsData(url) {
      return get(url).then((response) => {
        if (response.data) {
          const {features, links} = response.data;
          this.next_link = links.find(el => el.rel === "next")?.href;
          return features || [];
        }
      });
    },
    async handleLoadMoreItems(url) {
      this.over_loading = true;
      const more_data = await this.loadItemsData(url);
      this.dataList = [...this.dataList, ...more_data];
      this.over_loading = false;
    },
    async handleFilterByTerms(term_query) {
      clearTimeout(this.nameSearchTimeout);
      const {q} = this.$route.query;
      if (term_query?.length < 3 && q ) {
        this.nameSearchTimeout = setTimeout(() => {
          this.$router.push({path: ""});
        }, 250);
      }else {
         this.nameSearchTimeout = setTimeout(() => {
          this.$router.push({path: "", query: {q: term_query}});
        }, 250);
      }


    }
  },

});


</script>


<template>
  <div class="w-100 container">


    <div class="section p-ml-5">
      <div class="col-xl-3 col-md-3 col-lg-3  col-sm-12 filter pt-5">

        <TagFilterComponent
          v-if="!!tags"
          :handle-filter-tags="handleFilterTag"
          :filtered-tags="filtered_tags"
          :termFilter="computed(() => term_filter)"
          @handleTermFilter="handleFilterByTerms"
          :tags="tags"
        />
      </div>
      <div class="col-xl-9 col-md-9 col-lg-9 col-sm-12 ">
        <template v-if="loading">
          <awaiter :is-visible="loading"/>
        </template>
        <template v-else>

          <b-overlay :show="over_loading" rounded="sm">

            <div>
              <text-view class="p-pl-3" type="header__b20"> {{ title }}</text-view>
            </div>
            <div v-if="!!keywordSearched" class="p-d-flex p-flex-wrap p-ai-baseline p-pl-3 mt-2k">
              <TextView type="header__b14" class="text-primary"> {{ $t("fields.keyword_search", [keywordSearched]) }} :
              </TextView>
              <b-badge
                @click="handleResetKeywordCriteriaSearch"
                variant="secondary"
                class="cursor p-ml-5 p-px-2" size="lg">
                {{ $t("reset") }}
                <b-icon-arrow-repeat/>
              </b-badge>
            </div>

            <b-row v-if="dataList.length !== 0" class="p-d-flex p-flex-wrap p-ai-center">
              <item-card v-for="dataset in dataList" :stac="dataset"/>
            </b-row>
            <h3 class="p-mt-6" v-else> {{ $t('fields.no_data_found', [':(']) }}</h3>
            <b-row v-if="!!next_link" class="p-d-flex p-flex-wrap  p-jc-center mt-3">
              <b-button
                @click="$event => handleLoadMoreItems(next_link)"
                variant="outline-primary"
                size="sm">
                {{ $t('showMore') }}
              </b-button>
            </b-row>
          </b-overlay>

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
