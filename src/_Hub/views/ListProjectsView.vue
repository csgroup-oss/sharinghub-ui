<template>
  <div class="w-100 container">
    <div class="section lg:ml-5 xl:ml-5">
      <div class="col-xl-3 col-lg-3 col-md-3 col-sm-12 p-0">
        <TagFilterComponent
          v-if="!!tags"
          :handle-reset-tags="handleResetTags"
          :handle-filter-tags="handleFilterTag"
          :filtered-tags="filtered_tags" :tags="tags"
        />
      </div>

      <div class="col-xl-9 col-md-9 col-lg-9 col-sm-12">
        <div class="flex sm:flex-column lg:flex-row sm:align-content-center xl:align-items-center lg:align-items-center justify-content-between">
          <div class="sm:w-full lg:w-fit xl:w-fit flex sm:flex-column lg:flex-row sm:align-items-center lg:align-items-end">
            <div class="text-center">
              <text-view class="pl-3" type="header__b20">
                {{ title }}
              </text-view>
              <text-view type="header__16" class="text-secondary font-bold text-xl ml-2" v-if="get_data_matched() !== 0">
                {{ get_data_matched() }}
              </text-view>
            </div>

            <div class="sm:w-full md:w-fit lg:w-fit xl:w-fit sm:my-2 md:my-2 lg:my-0 xl:my-0">
              <b-button
                v-if="isAuthenticated && createProjectLink"
                class="btn-wizard flex sm:w-full  sm:ml-0 md:ml-0 lg:ml-4 xl:ml-4"
                :href="createProjectLink"
                variant="primary"
                v-b-tooltip.hover :title="$t('actions.newProject')"
                size="small"
                block
              >
                <span class="sm:block md:block lg:hidden xl:hidden mr-2">{{ $t('actions.newProject') }}</span>
                <b-icon icon="plus-lg" />
              </b-button>
            </div>
          </div>

          <div class="flex align-items-center col-sm-12 col-md-12 col-lg-6 col-xl-6 sm:mt-3 md:mt-3 lg:mt-0 xl:mt-0">
            <b-input-group size="sm" class="">
              <b-form-input
                type="text" v-model="term_filter" autocomplete="false" @update="handleFilterByTerms"
                :placeholder="$t('fields.filter_by_name')"
              />
            </b-input-group>

            <b-form-select :disabled="only_starred_project" @change="handleSort" v-model="options.selected" class="ml-3" size="sm">
              <b-form-select-option value="+properties.title">
                {{
                  $t("fields.sort.title")
                }}
              </b-form-select-option>
              <b-form-select-option value="-properties.sharinghub:stars">
                {{ $t("fields.sort.like") }}
              </b-form-select-option>
              <b-form-select-option value="-properties.created">
                {{ $t("fields.sort.created") }}
              </b-form-select-option>
              <b-form-select-option value="-properties.updated">
                {{ $t("fields.sort.updated") }}
              </b-form-select-option>
            </b-form-select>

            <b-button
              v-if="isAuthenticated" @click="handleSelectStarredProject(!only_starred_project)"
              v-b-tooltip.hover.topleft :title="$t('fields.tags.starred_project')"
              class="ml-2" :variant="only_starred_project ? 'primary':'outline-primary'"
              size="sm"
            >
              <b-icon icon="star" />
            </b-button>
          </div>
        </div>
        <template v-if="loading">
          <awaiter class="mt-4" :is-visible="loading" />
        </template>

        <template v-else>
          <b-overlay :show="over_loading" rounded="sm" class="pr-3">
            <b-row v-if="dataList.length !== 0" class="flex flex-wrap align-items-center">
              <item-card
                v-for="(dataset, idx) in dataList"
                :key="idx"
                :stac="dataset"
              />
            </b-row>
            <h3 class="ml-3 mt-6" v-else>
              {{ $t("fields.no_data_found", [":("]) }}
            </h3>
            <b-row v-if="!!next_link" class="flex flex-wrap justify-content-center mt-3">
              <b-button @click="($event) => handleLoadMoreItems(next_link)" variant="outline-primary" size="sm">
                {{ $t("showMore") }}
              </b-button>
            </b-row>
          </b-overlay>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {defineComponent } from 'vue';
import TextView from '@/_Hub/components/TextView.vue';
import { mapState } from 'vuex';
import ItemCard from '@/_Hub/components/ItemCard.vue';
import { get, CONNEXION_MODE } from '@/_Hub/tools/https';
import { PROXY_URL, STAC_SEARCH} from '@/_Hub/Endpoint';
import Awaiter from '@/_Hub/components/Awaiter.vue';
import _ from 'lodash';
import TagFilterComponent from '@/_Hub/components/TagFilterComponent.vue';

const DEFAULT_SORT = '-properties.updated';
export default defineComponent({
  name: 'ListProjectsView',
  components: { TagFilterComponent, Awaiter, ItemCard, TextView },
  data() {
    return {
      dataList: [],
      title: '',
      loading: true,
      tags: undefined,
      pagination: 1,
      filtered_tags: [],
      next_link: undefined,
      over_loading: false,
      term_filter: null,
      nameSearchTimeout: null,
      options: {
        selected: DEFAULT_SORT
      },
      data_context : undefined,
      only_starred_project: false
    };
  },
  computed: {
    ...mapState(['data', 'auth', 'entriesRoute', 'uiLanguage', 'provideConfig']),
    isAuthenticated(){
      return [CONNEXION_MODE.PRIVATE_TOKEN,  CONNEXION_MODE.CONNECTED].includes( this.auth.mode);
    },
    createProjectLink() {
      const category = this.$route.meta?.category;
      const {wizard} = this.provideConfig;
      const {url} = wizard;
      if (!url) {
        return null;
      }
      if (category){
        return `${url}${url.endsWith('/') ? '' : '/'}#/?category=${category}&redirect_url=${window.location.origin}`;
      }
      return `${url}${url.endsWith('/') ? '' : '/'}#/?redirect_url=${window.location.origin}`;
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler(route) {
        this.handleResetQuery(route.query);
        this.filtered_tags = [];
        this.dataList = [];
        this.dataList = [...(await this.fetchCollectionsItems())];
      }
    },
    entriesRoute: {
      immediate: true,
      async handler(newVal, oldValue) {
        if (oldValue?.length > 0 && !_.isEqual(newVal, oldValue)) {
          this.dataList = [];
          this.dataList = [...(await this.fetchCollectionsItems())];
        }
      }
    }
  },
  async beforeMount() {

    this.getTopics();
    const { starred } = this.$route.query;
    this.only_starred_project = !!starred;
  },
  methods: {
    async getTopics() {
      const {default_tags} = this.provideConfig;
      if(default_tags){
        this.tags = default_tags;
      }
       get(PROXY_URL.concat('tags'))
        .then((response) => {
          if (response.data) {
            this.tags = response.data;
          }
        })
        .catch(() => {});
    },
    async fetchCollectionsItems(url = STAC_SEARCH, defaultSort=DEFAULT_SORT) {
      this.loading = true;
      this.data_context = undefined;
      let { q, topics, sortby, starred } = this.$route.query;
      let category = this.$route.meta?.category;

      const topic = this.entriesRoute.find((el) => el.route === category);
      this.title = topic?.title || ' ';

      if(!sortby){
        sortby = defaultSort;
      }

      let searchUrl = url.concat(`?mode=preview&collections=${category}&limit=30`);

      if (q) {
        searchUrl = this.addQueryToUrl(searchUrl, q);
      }
      if (topics) {
        this.selectedFilterFromURL(topics);
        searchUrl = this.addTopicsToUrl(searchUrl, this.filtered_tags);
      }
      if (starred) {
        searchUrl = this.addStarredToUrl(searchUrl);
      }

      if (sortby) {
        searchUrl = this.addSortToUrl(searchUrl, sortby);
      }

      return get(searchUrl)
        .then((response) => {
          if (response.data) {
            const { features, links, context } = response.data;
            this.next_link = links.find((el) => el.rel === 'next')?.href;
            this.loading = false;
            this.data_context = context;
            return features || [];
          } else {
            this.next_link = undefined;
            return [];
          }
        })
        .catch(() => {
          this.loading =false;
          this.$store.commit('clearSession');
          if (this.$route.name !== 'Login') {
            this.$router.push({
              path: '/login',
              query: { redirect: this.$route.meta?.category }
            });
          }
        });
    },
    async handleFilterTag(item) {
      let query = {};
      const { topics, q, sortby, starred } = this.$route.query;
      let array_topics = topics ? topics.split(',') : [];
      if (!array_topics.includes(item)) {
        array_topics.push(item);
      } else {
        array_topics = array_topics.filter((el) => el !== item);
      }
      this.filtered_tags = array_topics;
      if (array_topics.length !== 0) {
        query = { ...query, topics: array_topics.join(',') };
      }
      query = q ? { ...query, q } : query;
      query = sortby ? { ...query, sortby } : query;
      query = starred ? { ...query, starred } : query;
      this.$router.push({ path: '', query });
    },
    async loadItemsData(url) {
      return get(url).then((response) => {
        if (response.data) {
          const { features, links } = response.data;
          this.next_link = links.find((el) => el.rel === 'next')?.href;
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
      const { q, topics, sortby, starred } = this.$route.query;
      let query = {};
      if (term_query?.length < 3 && q) {
        this.nameSearchTimeout = setTimeout(() => {
          query = topics ? { ...query, topics } : query;
          query = sortby ? { ...query, sortby } : query;
          query = starred ? { ...query, starred } : query;
          this.$router.push({ path: '', query });
        }, 750);
      } else {
        query = { ...query, q: term_query };
        query = topics ? { ...query, topics } : query;
        query = sortby ? { ...query, sortby } : query;
        query = starred ? { ...query, starred } : query;
        this.nameSearchTimeout = setTimeout(() => {
          this.$router.push({ path: '', query });
        }, 750);
      }
    },
    async handleSort(criteria) {
      let query = {};
      const { topics, q } = this.$route.query;
      query = q ? { ...query, q } : query;
      query = topics ? { ...query, topics } : query;
      query = criteria ? { ...query, sortby: criteria } : query;
      this.$router.push({ path: '', query });
    },
    addQueryToUrl(_url, q) {
      let has_freetext_query = _url.includes('&q=');
      return has_freetext_query ? _url.concat(`,${q}`) : _url.concat(`&q=${q}`);
    },
    addSortToUrl(_url, criteria) {
      return _url.concat(`&sortby=${criteria}`);
    },
    addTopicsToUrl(_url, topics = []) {
      let has_freetext_query = _url.includes('&q=');
      let url = has_freetext_query ? _url : _url.concat('&q=');
      topics.forEach((topic, index) => {
        url = has_freetext_query
          ? url.concat(`,[${topic}]`)
          : index !== topics.length - 1
          ? (url = url.concat(`[${topic}],`))
          : (url = url.concat(`[${topic}]`));
      });
      return url;
    },
    addStarredToUrl(_url) {
      let has_freetext_query = _url.includes('&q=');
      return has_freetext_query
        ? _url.concat(`,:starred`)
        : _url.concat(`&q=:starred`);
    },
    selectedFilterFromURL(queryTopics) {
      queryTopics.split(',').forEach((el) => {
        if (el && el !== '') {
          this.filtered_tags = [...this.filtered_tags, el];
        }
      });
    },
    handleResetQuery({ q, sortby }) {
      this.term_filter = q ? q : null;
      this.options.selected = sortby ? sortby : DEFAULT_SORT;
    },
    handleResetTags() {
      const { q, sortby, topics } = this.$route.query;
      if (!topics) {
        return;
      }
      this.filtered_tags = [];

      let query = {};
      query = q ? { ...query, q } : query;
      query = sortby ? { ...query, sortby } : query;
      this.$router.push({ path: '', query });
    },
    handleSelectStarredProject(only_starred) {
      this.only_starred_project = only_starred;
      let query = {};
      const { topics, q } = this.$route.query;
      query = q ? { ...query, q } : query;
      query = topics ? { ...query, topics } : query;
      if (only_starred) {
        query = { ...query, starred: true };
      }
      this.$router.push({ path: '', query });
    },
    get_data_matched(){
      if(!this.data_context){
        return;
      }
      const {matched} = this.data_context;
      return matched || 0;
    }
  }
});
</script>

<style scoped lang="scss">
@import "../../assets/colors";
@import "../../theme/variables";

.section {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  .btn-wizard{
    display: inline-flex;
    padding: 0.35rem 0.1rem;
    align-items: center;
    justify-content: center;
    font-size: 11px;
  }
}

@media screen and (max-width: 575px) {
  .section {
    .sm\: {
      &flex-column {
        flex-direction:  column !important;
      }
      &mt-3{
        margin-top: 1rem;
      }
      &my-2{
        margin: 0.6rem 0px;
      }
    }
    .btn-wizard{
      font-size: 15px !important;
    }
  }
}

@media screen and (min-width: 575px) and  (max-width: 985px) {
  .section {
    .btn-wizard{
      font-size: 15px !important;
      padding: 0.35rem 0.5rem;
    }
  }
}
@media screen and (min-width: 980px) and (max-width: 1217px){
 .container{
   margin-top: 3rem !important;
 }
}
</style>
