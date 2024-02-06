<template>
  <b-form class="filter mb-4" @submit.stop.prevent="onSubmit" @reset="onReset">
    <b-card no-body :title="title">
      <b-card-body>
        <Loading v-if="!loaded" fill/>

        <b-card-title v-if="title" :title="title"/>
        <b-form-group v-if="canFilterFreeText" :label="$t('search.freeText')" :label-for="ids.q"
                      :description="$t('search.freeTextDescription')">
          <multiselect
            :id="ids.q" :value="query.q" @input="setSearchTerms"
            multiple taggable :options="query.ids"
            :placeholder="$t('search.enterSearchTerms')"
            :tagPlaceholder="$t('search.addSearchTerm')"
            :noOptions="$t('search.addSearchTerm')"
            @tag="addSearchTerm"
          >
            <template #noOptions>{{ $t('search.noOptions') }}</template>
          </multiselect>
        </b-form-group>

        <b-form-group v-if="canFilterExtents" :label="$t('search.temporalExtent')" :label-for="ids.datetime"
                      :description="$t('search.dateDescription')">
          <date-picker
            range :id="ids.datetime" :lang="datepickerLang" :format="datepickerFormat"
            :value="query.datetime" @input="setDateTime" input-class="form-control mx-input"
          />
        </b-form-group>

        <b-form-group v-if="canFilterExtents" :label="$t('search.spatialExtent')" :label-for="ids.bbox">
          <b-form-checkbox :id="ids.bbox" v-model="provideBBox" value="1" @change="setBBox()">
            {{ $t('search.filterBySpatialExtent') }}
          </b-form-checkbox>
          <Map class="mb-4" v-if="provideBBox" :stac="stac" selectBounds @bounds="setBBox" scrollWheelZoom/>
        </b-form-group>

        <b-form-group v-if="conformances.CollectionIdFilter" :label="$tc('stacCollection', 1)"
                      :label-for="ids.collections">
          <b-form-select  @change="addCollection" v-bind="collectionSelectOptions">
          </b-form-select>
        </b-form-group>

        <!-- #filter tags -->
        <!-- <b-form-group :label="$tc('stacTag', topics.length)" :label-for="ids.topics">
          <multiselect
            :id="ids.topics"
            multiple taggable
            :value="this.selectedTopics"
            :options="topics"
            label="text" trackBy="value"
            :placeholder="$t('search.selectTopics')"
            :tagPlaceholder="$t('search.addItemIds')"
            :noOptions="$t('search.addItemIds')"
            @input="setTags"
          >
            <template #noOptions>{{ $t('search.noOptions') }}</template>
            <template v-if="additionalCollectionCount > 0" #afterList>
              <li>
                <strong class="multiselect__option multiselect__option--disabled">
                  {{ $t("multiselect.andMore", {count: additionalCollectionCount}) }}
                </strong>
              </li>
            </template>
          </multiselect>
        </b-form-group> -->

        <b-form-group v-if="conformances.ItemIdFilter" :label="$t('search.itemIds')" :label-for="ids.ids">
          <multiselect
            :id="ids.ids" :value="query.ids" @input="setIds"
            multiple taggable :options="query.ids"
            :placeholder="$t('search.enterItemIds')"
            :tagPlaceholder="$t('search.addItemIds')"
            :noOptions="$t('search.addItemIds')"
            @tag="addId"
          >
            <template #noOptions>{{ $t('search.noOptions') }}</template>
          </multiselect>
        </b-form-group>

        <div class="additional-filters" v-if="showAdditionalFilters">
          <b-form-group :label="$t('search.additionalFilters')">
            <b-form-radio-group v-model="filtersAndOr" :options="andOrOptions" name="logical" size="sm"/>

            <b-dropdown size="sm" :text="$t('search.addFilter')" block variant="primary" class="queryables mt-2 mb-3"
                        menu-class="w-100">
              <template v-for="queryable in sortedQueryables">
                <b-dropdown-item v-if="queryable.supported" :key="queryable.id"
                                 @click="additionalFieldSelected(queryable)">
                  {{ queryable.title }}
                  <b-badge variant="dark" class="ml-2">{{ queryable.id }}</b-badge>
                </b-dropdown-item>
              </template>
            </b-dropdown>

            <QueryableInput
              v-for="(filter, index) in filters" :key="filter.id"
              :value.sync="filter.value"
              :operator.sync="filter.operator"
              :queryable="filter.queryable"
              :index="index"
              :cql="cql"
              @remove-queryable="removeQueryable(index)"
            />
          </b-form-group>
        </div>

        <hr
          v-if="canFilterExtents || conformances.CollectionIdFilter || conformances.ItemIdFilter || showAdditionalFilters">

        <b-form-group v-if="canSort" :label="$t('sort.title')" :label-for="ids.sort"
                      :description="$t('search.notFullySupported')">
          <multiselect
            :id="ids.sort" :value="sortTerm" @input="sortFieldSet"
            :options="sortOptions" track-by="value" label="text"
            :placeholder="$t('default')"
            :selectLabel="$t('multiselect.selectLabel')"
            :selectedLabel="$t('multiselect.selectedLabel')"
            :deselectLabel="$t('multiselect.deselectLabel')"
          />
          <SortButtons v-if="sortTerm && sortTerm.value" class="mt-1" :value="sortOrder" enforce
                       @input="sortDirectionSet"/>
        </b-form-group>

        <b-form-group :label="$t('search.itemsPerPage')" :label-for="ids.limit"
                      :description="$t('search.itemsPerPageDescription', {maxItems})">
          <b-form-input
            :id="ids.limit" :value="query.limit" @change="setLimit" min="1"
            :max="maxItems" type="number"
            :placeholder="$t('defaultWithValue', {value: itemsPerPage})"
          />
        </b-form-group>
      </b-card-body>
      <b-card-footer>
        <b-alert v-if="!this.selectedCollections" variant="danger" show>{{ $t('fields.search.collection_mandatory') }}</b-alert>
        <b-button :disabled="!this.selectedCollections" type="submit" variant="primary">{{ $t('submit') }}</b-button>
        <b-button type="reset" variant="danger" class="ml-3">{{ $t('reset') }}</b-button>
      </b-card-footer>
    </b-card>
  </b-form>
</template>

<script>
import {
  BBadge,
  BDropdown,
  BDropdownItem,
  BForm,
  BFormCheckbox,
  BFormGroup,
  BFormInput,
  BFormRadioGroup
} from 'bootstrap-vue';
import Multiselect from 'vue-multiselect';
import {mapGetters, mapState} from "vuex";
import refParser from '@apidevtools/json-schema-ref-parser';

import Utils, {schemaMediaType} from '../utils';
import {ogcQueryables} from "../rels";

import ApiCapabilitiesMixin, {TYPES} from './ApiCapabilitiesMixin';
import DatePickerMixin from './DatePickerMixin';
import Loading from './Loading.vue';

import STAC from '../models/stac';
import Cql from '../models/cql2/cql';
import Queryable from '../models/cql2/queryable';
import CqlValue from '../models/cql2/value';
import CqlLogicalOperator from '../models/cql2/operators/logical';
import {CqlEqual} from '../models/cql2/operators/comparison';
import {stacRequest} from '../store/utils';
import {PROXY_URL} from "@/_Hub/Endpoint";
import {get} from "@/_Hub/tools/https";
import _ from "lodash"

function getQueryDefaults() {
  return {
    q: [],
    datetime: null,
    bbox: null,
    limit: null,
    ids: [],
    collections: [],
    sortby: null,
    filters: null,
    topics: [],

  };
}

function getDefaults() {
  return {
    sortOrder: 1,
    sortTerm: null,
    provideBBox: false,
    query: getQueryDefaults(),
    filtersAndOr: 'and',
    filters: [],
    selectedCollections: null,
    selectedTopics: [],
  };
}

let formId = 0;

export default {
  name: 'SearchFilter',
  components: {
    BBadge,
    BDropdown,
    BDropdownItem,
    BForm,
    BFormGroup,
    BFormInput,
    BFormCheckbox,
    BFormRadioGroup,
    QueryableInput: () => import('./QueryableInput.vue'),
    Loading,
    Map: () => import('./Map.vue'),
    SortButtons: () => import('./SortButtons.vue'),
    Multiselect
  },
  mixins: [
    ApiCapabilitiesMixin,
    DatePickerMixin
  ],
  props: {
    parent: {
      type: Object,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: { // Collections or Global or Items
      type: String,
      required: true
    },
    value: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return Object.assign({
      results: null,
      maxItems: 10000,
      loaded: false,
      queryables: null,
      hasAllCollections: false,
      collections: [],
      topics: [],
      collectionsLoadingTimer: null,
      additionalCollectionCount: 0
    }, getDefaults());
  },
  computed: {
    ...mapState(['itemsPerPage', 'uiLanguage', 'entriesRoute']),
    ...mapGetters(['canSearchCollections', 'supportsConformance']),
    collectionSelectOptions() {
      return {
        value: this.selectedCollections,
        options: [
          {value: null, text:this.$t('search.selectCollection')},
          ...this.collections
        ], // query.collections
        trackBy: "value",
        label: "text",
      };
    },
    collectionSearchLink() {
      return this.parent instanceof STAC && this.parent.getApiCollectionsLink();
    },
    canSearchCollectionsFreeText() {
      return this.canSearchCollections && this.supportsConformance(TYPES.Collections.FreeText);
    },
    ids() {
      let obj = {};
      ['q', 'datetime', 'bbox', 'collections', 'ids', 'sort', 'limit', "topics"]
        .forEach(field => obj[field] = field + formId);
      return obj;
    },
    stac() {
      if (this.parent instanceof STAC) {
        return this.parent;
      }
      return null;
    },
    andOrOptions() {
      return [
        {value: 'and', text: this.$i18n.t('search.logical.and')},
        {value: 'or', text: this.$i18n.t('search.logical.or')},
      ];
    },
    showAdditionalFilters() {
      return this.cql && Array.isArray(this.queryables) && this.queryables.length > 0;
    },
    sortOptions() {
      return [
        {value: null, text: this.$t('default')},
        {value: 'properties.datetime', text: this.$t('search.sortOptions.datetime')},
        {value: 'id', text: this.$t('search.sortOptions.id')},
        {value: 'properties.title', text: this.$t('search.sortOptions.title')}
      ];
    },
    sortedQueryables() {
      return this.queryables.slice(0).sort((a, b) => a.title.localeCompare(b.title));
    }
  },
  watch: {
    parent: {
      immediate: true,
      handler(newStac, oldStac) {
        if (newStac instanceof STAC) {
          newStac.setApiDataListener('searchfilter' + formId, () => this.updateApiCollections());
        }
        if (oldStac instanceof STAC) {
          oldStac.setApiDataListener('searchfilter' + formId);
        }
        this.updateApiCollections();
      }
    },
    entriesRoute: {
      immediate: true,
      handler(newVal, oldValue) {
        if (oldValue?.length > 0 && !_.isEqual(newVal, oldValue)) {
          this.collections = this.translateCollections(this.collections, newVal);
        }
      }

    }
  },
  beforeCreate() {
    formId++;
  },
  created() {
    let promises = [];
    if (this.cql && this.stac) {
      let queryableLink = this.findQueryableLink(this.stac.links);
      promises.push(
        this.loadQueryables(queryableLink)
          .catch(error => console.error(error))
      );
    }
    promises.push(this.loadTopicsForTags().then((data) => {
      this.preSelectTag(data);
    }));
    if ((this.type === 'Collections' || this.conformances.CollectionIdFilter) && this.stac) {
      promises.push(
        this.loadCollections(this.stac.getApiCollectionsLink())
          .then(({collections, queryableLink}) => {
            this.collections = this.translateCollections(collections, this.entriesRoute);
            if (this.collections.length > 0) {
              this.hasAllCollections = true;
            }
            return this.loadQueryables(queryableLink);
          })
          .catch(error => console.error(error))
      );
    }
    Promise.all(promises).finally(() => {
      this.loaded = true;
    });
    const {q} = this.$route.query;
    if (q) {
      this.query.q = [q];
      this.onSubmit();
    }

  },
  methods: {
    resetSearchCollection() {
      clearTimeout(this.collectionsLoadingTimer);
      this.collectionsLoadingTimer = null;
    },

    async loadCollections(link) {
      let hasMore = false;
      let data = {
        collections: [],
        queryableLink: null
      };

      if (this.type === 'Global' && this.collections) {
        data.collections = this.collections;
        hasMore = false;
      } else if (this.type === 'Global' || this.type === 'Collections') {
        let response = await stacRequest(this.$store, link);
        if (!Utils.isObject(response.data)) {
          return {};
        }

        if (Array.isArray(response.data.links)) {
          let links = response.data.links;
          hasMore = Boolean(Utils.getLinkWithRel(links, 'next'));
          data.queryableLink = this.findQueryableLink(links) || null;
        }

        if (!hasMore && Array.isArray(response.data.collections)) {
          let collections = response.data.collections
            .map(collection => new STAC(collection));
          data.collections = this.prepareCollections(collections);
        }
      }
      return data;
    },
    async loadTopicsForTags(link = PROXY_URL.concat('topics')) {
      return get(link).then((response) => {
        if (response.data) {
          this.topics = response.data.map(el => (
            {value: el.title, text: el.title}
          )).sort((a, b) => a.text.localeCompare(b.text, this.uiLanguage));
          return this.topics;
        }
      }).catch(() => {
        if (this.$route.name !== "Login") {
          this.$router.push("/login");
        }
      });
    },
    preSelectTag(topics) {
      const {tags: _preSelectTopics} = this.$route.query;
      let selected_topic = topics.find(el => el.value === _preSelectTopics);
      if (selected_topic) {
        this.setTags([selected_topic]);
      }

    },
    updateApiCollections() {
      if (!this.parent) {
        return;
      }
      let apiCollections = this.parent.getChildren('collections');
      let nextCollectionsLink = this.parent._apiChildren.next;
      if (!Array.isArray(apiCollections) || nextCollectionsLink || !this.conformances.CollectionIdFilter) {
        this.collections = [];
        return;
      }
      this.collections = this.prepareCollections(apiCollections);
      if (this.collections.length > 0) {
        this.hasAllCollections = true;
      }
    },
    collectionToMultiSelect(c) {
      return {
        value: c.id,
        text: c.title || c.id
      };
    },
    prepareCollections(collections) {
      return collections
        .map(this.collectionToMultiSelect)
        .sort((a, b) => a.text.localeCompare(b.text, this.uiLanguage));
    },
    findQueryableLink(links) {
      return Utils.getLinksWithRels(links, ogcQueryables)
        .find(link => Utils.isMediaType(link.type, schemaMediaType, true));
    },
    async loadQueryables(link) {
      this.queryables = [];

      if (!Utils.isObject(link)) {
        return;
      }

      let response = await stacRequest(this.$store, link);
      if (!Utils.isObject(response.data)) {
        return;
      }

      let schemas;
      try {
        schemas = await refParser.dereference(response.data);
      } catch (error) {
        // Use data with $refs included as fallback anyway
        console.error(error);
        schemas = response.data;
      }

      if (Utils.isObject(schemas) && Utils.isObject(schemas.properties)) {
        this.queryables = Object.entries(schemas.properties)
          .map(([key, schema]) => new Queryable(key, schema));
      }
    },
    sortFieldSet(value) {
      this.sortTerm = value;
    },
    sortDirectionSet(value) {
      this.sortOrder = value;
    },
    buildFilter() {
      if (this.filters.length === 0) {
        return null;
      }
      const args = this.filters.map(f => new f.operator(f.queryable, f.value));
      const logical = CqlLogicalOperator.create(this.filtersAndOr, args);
      return new Cql(logical);
    },
    removeQueryable(queryableIndex) {
      this.filters.splice(queryableIndex, 1);
    },
    additionalFieldSelected(queryable) {
      this.filters.push({
        value: CqlValue.create(queryable.defaultValue),
        operator: CqlEqual,
        queryable
      });
    },
    onSubmit() {

      if (this.canSort && this.sortTerm && this.sortOrder) {
        this.$set(this.query, 'sortby', this.formatSort());
      }
      let filters = this.buildFilter();
      this.$set(this.query, 'filters', filters);
      this.$emit('input', this.query, false);
    },
    async onReset() {
      Object.assign(this, getDefaults());
      this.$emit('input', {}, true);
    },
    setLimit(limit) {
      limit = Number.parseInt(limit, 10);
      if (limit > this.maxItems) {
        limit = this.maxItems;
      } else if (typeof limit !== 'number' || isNaN(limit) || limit < 1) {
        limit = null;
      }
      this.$set(this.query, 'limit', limit);
    },
    addSearchTerm(term) {
      if (!Utils.hasText(term)) {
        return;
      }
      this.query.q.push(term);
    },
    setSearchTerms(terms) {
      this.$set(this.query, 'q', terms);
    },
    setBBox(bounds) {
      let bbox = null;
      if (this.provideBBox) {
        if (Utils.isObject(bounds) && typeof bounds.toBBoxString === 'function') {
          // This is a Leaflet LatLngBounds Object
          const Y = 85.06;
          const X = 180;
          bbox = [
            Math.max(bounds.getWest(), -X),
            Math.max(bounds.getSouth(), -Y),
            Math.min(bounds.getEast(), X),
            Math.min(bounds.getNorth(), Y)
          ];
        } else if (Array.isArray(bounds) && bounds.length === 4) {
          bbox = bounds;
        }
      }
      this.$set(this.query, 'bbox', bbox);
    },
    setDateTime(datetime) {
      if (datetime.find(dt => dt instanceof Date)) {
        datetime = datetime.map(Utils.dateToUTC);
      } else {
        datetime = null;
      }
      this.$set(this.query, 'datetime', datetime);
    },
    addCollection(collection) {
      this.selectedCollections = collection
      this.query.collections =[collection];
    },
    addId(id) {
      this.query.ids.push(id);
    },
    setIds(ids) {
      this.$set(this.query, 'ids', ids);
    },
    formatSort() {
      if (this.sortTerm && this.sortTerm.value && this.sortOrder) {
        let order = this.sortOrder < 0 ? '-' : '';
        return `${order}${this.sortTerm.value}`;
      } else {
        return null;
      }
    },
    setTags(topics) {
      this.selectedTopics = topics;
      this.$set(this.query, 'topics', topics.map(c => c.value));
    },
    translateCollections(_collections = [], _entriesRoute) {
      if (!Array.isArray(_collections) || !Array.isArray(_entriesRoute)) {
        return _collections;
      }
      return _collections.map((el) => {
        const equal = _entriesRoute.find(eq => eq.route === el.value);
        return {
          value: equal.route,
          text: equal.title
        };
      });
    },

  }
};
</script>

<style src=""></style>

<style lang="scss">
@import '../theme/variables.scss';

// Datepicker related style
$default-color: map-get($theme-colors, "secondary");
$primary-color: map-get($theme-colors, "primary");

@import '~vue2-datepicker/scss/index.scss';

// Multiselect related style
@import '~vue-multiselect/dist/vue-multiselect.min.css';
#stac-browser {
  .multiselect__tags:focus-within {
    border-color: #48cce1;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(24, 129, 145, 0.25);
  }

  .multiselect__select:before {
    color: #495057;
    border-color: #495057 transparent transparent;
  }

  .multiselect__tags,
  .multiselect__single {
    border-color: #ced4da;
    padding-left: 0.75rem;
    font-size: 16px;
  }

  .multiselect__input,
  .multiselect__single {
    padding: 4px 0 3px 0;
  }

  .multiselect__tag,
  .multiselect__tag-icon:hover,
  .multiselect__option--highlight,
  .multiselect__option--highlight:after {
    background-color: map-get($theme-colors, "primary");
  }

  .multiselect__option--selected.multiselect__option--highlight,
  .multiselect__option--selected.multiselect__option--highlight:after {
    background-color: map-get($theme-colors, "secondary");
  }

  .multiselect__placeholder {
    color: #999;
    font-size: 16px;
  }
}

.queryables {
  .dropdown-menu {
    max-height: 90vh;
    overflow: auto;
  }
}

// General item filter style
.filter {
  position: relative;

  .mx-datepicker {
    width: 100%;
  }

  .form-group {
    > div {
      margin-left: 1em;
    }

    > label {
      font-weight: 600;
    }
  }
}
</style>
