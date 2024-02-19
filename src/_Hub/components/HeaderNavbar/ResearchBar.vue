<template>
  <div class="research-bar">
    <b-input-group size="md" class="">
      <b-form-input :disabled="!canSearch"
                    type="text"
                    ref="input_search"
                    v-model="value"
                    autocomplete="false"
                    @update="handleSearch"
                    @focus="handleOpenSearchResult"
                    :placeholder="$t('fields.search_placeholder') ">
      </b-form-input>
      <b-input-group-prepend style="height: 33px">

      </b-input-group-prepend>
      <b-input-group-prepend style="height: 33px">
        <b-button v-if="is_loading" variant="outline-primary">
          <b-icon style="padding-bottom: 3px;" icon="circle-fill" animation="throb"/>
        </b-button>
        <b-button v-else :disabled="!canSearch" to="/search/" id="tooltip-target-advance-research"
                  :variant="variant">
          <b-icon style="padding-bottom: 3px;" icon="sliders"/>
        </b-button>
      </b-input-group-prepend>
      <b-tooltip target="tooltip-target-advance-research" triggers="hover">
        <text-view>{{ $t('fields.advanced_search') }}</text-view>
      </b-tooltip>
    </b-input-group>

    <div v-if="open_search" ref="search_container" class="research-bar__results">
      <div v-if="!search_result_is_empty" class="flex flex-column mt-3">
        <div v-for="(result, idx) in search_results">
          <template v-for="([key, val] ) in Object.entries(result)">
            <div :class="['mt-2']" v-if="Array.isArray(val.features) && val.features.length!==0">
              <text-view type="header__b14" :class="['block px-3', `text-${getRandomColor(idx)}`]">
                {{ translateCategories(key) }}
              </text-view>
              <a v-for="(el) in val.features.slice(0, limit_displayed)"
                 :class="['research-bar__results__item px-4']"
                 @click="$event => handleSelectResult($event, itemLink(el.links))"
                 :href="itemLink(el.links)">
                <small> {{ el.properties['title'] }}
                </small>
              </a>
              <router-link v-if="val.numberMatched > limit_displayed && value.length > 2 "
                           class="research-bar__results__item px-4 see_more"
                           :to="`/${key}?q=${value}`">
                <small class="">
                  <b-icon icon="arrow-right-short"/>
                  {{ $t('fields.see_more', [val.numberMatched, translateCategories(key), value]) }} </small>
              </router-link>
            </div>

          </template>
        </div>
      </div>
      <div v-else class="flex flex-column m-3">
        <text-view type="Small-1"> {{ $t('fields.no_data_found', [':(']) }}</text-view>
      </div>
    </div>
  </div>

</template>

<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {get} from "@/_Hub/tools/https";
import {STAC_SEARCH} from "@/_Hub/Endpoint";
import {mapGetters, mapState} from "vuex";
import _ from "lodash";

export default defineComponent({
  name: "ResearchBar",
  components: {TextView},
  props: {
    categories: {
      type: Array,
      required: true,
    },
    canSearch: {
      type: Boolean,
      required: true,
    },
    variant:{
      type: String,
      required: false,
      default: "outline-secondary",
    }
  },
  data() {
    return {
      value: null,
      search_results: undefined,
      open_search: false,
      searchTimeout: null,
      search_result_is_empty: true,
      is_loading: false,
      limit_displayed: 4,
    };
  },
  computed: {
    ...mapState(['']),
    ...mapGetters(['toBrowserPath']),
  },

  watch: {
    $route: {
      immediate: true,
      handler() {
        this.open_search = false;
      }
    }
  },

  beforeDestroy() {
    document.removeEventListener('click', this.handleCloseSearchResult);
  },
  async mounted() {
    document.addEventListener('click', this.handleCloseSearchResult);
  },
  methods: {

    async searchRequest(query_terms) {
      this.is_loading = true;
      const buildUrl = (route, query_terms) => {
        const _query = query_terms ? STAC_SEARCH.concat(`?collections=${route}&q=${query_terms}`) : STAC_SEARCH.concat(`?collections=${route}`);
        return _query.concat("&limit=4");
      };
      const all_requests = this.categories.map(({route}) => {
        return get(buildUrl(route, query_terms))
          .then((response) => {
            if (response.data) {
              const {features, numberMatched} = response.data;
              return {
                [route]: {features, numberMatched}
              };
            } else {
              return [];
            }
          });
      });
      this.search_results = await Promise.all(all_requests).then((response) => response);

      const flattern = _.flattenDeep(this.search_results.map(el => {
        return Object.entries(el).map(([, val]) => {
          return val.features;
        });
      }));
      this.search_result_is_empty = flattern.length === 0;
      this.is_loading = false;
      this.open_search = true;
    },
    async handleSearch(query_terms) {
      clearTimeout(this.searchTimeout);
      if (query_terms?.length < 3) {
        return;
      }
      this.searchTimeout = setTimeout(async () => {
        await this.searchRequest(query_terms);
      }, 250);
    },


    getRandomColor(index) {
      const colors = ["primary", "info", "success", "warning", "danger", "dark"];
      return colors[index % colors.length];
    },
    translateCategories(entry) {
      const el = this.categories.find(el => el.route === entry);
      return el.title;
    },
    itemLink(links = []) {
      return links.find(el => el.rel === "self").href;
    },
    async handleSelectResult(event, url) {
      event.preventDefault();
      event.stopPropagation();
      const external = `/stac/${this.toBrowserPath(url).split('/').splice(4).join("/")}`;
      if (external !== this.$route.path) {
        this.$router.push({path: external});
      }
    },

    handleOpenSearchResult() {
      this.open_search = this.value?.length > 1;
    },
    handleCloseSearchResult(event) {
      const search_container = this.$refs.search_container;
      const input_search = this.$refs.input_search.$refs.input;
      if (input_search?.contains(event.target)) {
        return;
      }
      if (!search_container?.contains(event.target)) {
        this.open_search = false;
      }
    }

  }
});
</script>

<style scoped lang="scss">
@import "../../../theme/variables";
@import "../../../assets/colors";

.research-bar {
  input {
    height: 33px;
  }

  &__results {
    margin-top: 8px;
    position: absolute;
    width: 20.3%;
    min-width: 400px;
    //min-height: 80%;
    height: fit-content;
    background: map-get($theme-colors, "light");
    z-index: 1000;
    -webkit-box-shadow: 0px 1px 31px 0px rgba(map-get($theme-colors, "secondary"), 0.36);
    box-shadow: 0px 1px 31px 0px rgba(map-get($theme-colors, "secondary"), 0.36);

    &__item {
      text-decoration: none;
      color: black;
      display: block;
      cursor: pointer;
      padding: 4px;
      transition: background-color linear 0.4s;
      border-bottom: 1px solid rgba($secondary-color, 0.1);

      &:hover {
        background-color: rgba(map-get($theme-colors, "primary"), 0.3) !important;
      }
    }

    .see_more {
      font-size: 13px !important;
      background: rgba(map-get($theme-colors, "secondary"), 0.08);
    }
  }
}
</style>
