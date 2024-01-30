<template>
  <div class="p-d-flex p-flex-column p-flex-wrap w-100 tag-filter">

    <div class="col-xl-10 col-lg-10 col-md-12 col-sm-12 input-container">
      <b-input-group size="sm" class="mb-3 p-mt-2">
      <b-form-input
        type="text"
        v-model="term_filter"
        autocomplete="false"
        @update="updateInput"
        :placeholder="$t('fields.filter_by_name') ">
      </b-form-input>
    </b-input-group>
    </div>

    <b-tabs small pills size="sm">
      <b-tab :title="$t('fields.common_tag')" :active="!isPreSelect">
        <div v-for="key in filtered_section_tags" class="p-d-block mb-3 mt-4">
          <div class="p-d-block">
            <text-view class="text-primary" type="header__14"> {{ key.name }}</text-view>
            <b-row class="p-ml-1 p-mt-2">
              <b-badge v-for="tag in key.keywords" variant="light" pill @click="handleFilterTags(tag)"
                       :class="['m-1 cursor p-2', filteredTags.find(el => el === tag) && 'badge-active']">
                {{ tag }}
              </b-badge>
            </b-row>
          </div>
        </div>

      </b-tab>
      <b-tab :title="$t('fields.others')" :active="isPreSelect">
        <div class="p-d-flex p-flex-column p-ai-center">
          <b-row class="p-px-2 mt-4 p-d-flex p-flex-wrap">
            <b-badge v-for="tag in tags_from_gitlab" variant="light" pill @click="handleFilterTags(tag)"
                     :class="['m-1 cursor p-2', filteredTags.find(el => el === tag) && 'badge-active']">
              {{ tag }}
            </b-badge>
          </b-row>

          <b-button v-if="pagination<= tags.topics_from_gitlab.length" size="sm" pill
                    @click="$event => isTruncated = !isTruncated"
                    variant="light" class="mt-5">
            {{ isTruncated ? $t('read.less') : $t('read.more') }}
          </b-button>
        </div>
      </b-tab>
    </b-tabs>


  </div>
</template>


<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";


export default defineComponent({
  name: "TagFilterComponent",
  components: {TextView},
  props: {
    tags: {
      type: Object,
      required: true
    },
    filteredTags: {
      type: Array,
      required: true
    },
    handleFilterTags: {
      type: Function,
      required: true
    },

  },
  emits: ['handleTermFilter'],
  data() {
    return {
      pagination: 30,
      isPreSelect: false,
      isTruncated: false,
      term_filter: null
    };
  },
  computed: {
    tags_from_gitlab() {
      return this.isTruncated ? this.tags.topics_from_gitlab : this.tags.topics_from_gitlab.slice(0, this.pagination);
    },
    filtered_section_tags() {
      const routeName = this.$route.name;
      if (routeName === "DynamicListSTAC") {
        const {pathMatch} = this.$route.params;
        return this.tags.sections.filter(el => el.enabled_for.includes(pathMatch));
      } else {
        return this.tags.sections;
      }
    },

  },
  beforeMount() {
    this.isPreSelect = this.tags.topics_from_gitlab.some(el => this.filteredTags.includes(el)) || this.filtered_section_tags.length === 0;
  },
  methods: {
    updateInput(term_value) {
      this.$emit('handleTermFilter', term_value);
    }
  }
});
</script>

<style scoped lang="scss">
@import "../../assets/colors";
@import "../../theme/variables";

.tag-filter {
  min-height: 100%;
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(90deg, #FFFFFF, rgba(#129E83, 0.032));

  .input-container {
    padding: 0px!important;
  }

  .badge {
    //background-color: rgba($secondary-color,1) !important;
    border: 1px rgba($secondary-color, 1) solid;
    max-width: 240px;
    overflow-x: hidden;

  }

  .badge-active {
    color: #FFFFFF;
    background-color: map-get($theme-colors, "primary") !important;
  }
}
</style>
