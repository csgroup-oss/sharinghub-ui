<template>
  <div class="p-d-flex p-flex-column p-flex-wrap w-100 tag-filter">


    <template v-if="isAuthenticated">
      <b-form-checkbox v-model="only_starred_project" @change="this.handleChangeToogle" class="p-mb-3 cursor" name="check-button" switch>
        <text-view class="text-primary"> {{ $t('fields.tags.starred_projet') }}</text-view>
      </b-form-checkbox>
    </template>


    <b-tabs small pills size="sm">
      <b-tab :active="!isPreSelect">
        <template #title>
          {{ $t('fields.tags.common_tag') }} <b-badge v-if="number_commontag_selected !== 0" variant="light">{{
            number_commontag_selected }}</b-badge>
        </template>
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
      <b-tab :active="isPreSelect">
        <template #title>
          {{ $t('fields.tags.others') }} <b-badge v-if="number_others_tag_selected !== 0" variant="light">{{
            number_others_tag_selected }}</b-badge>
        </template>
        <div class="p-d-flex p-flex-column p-ai-center">
          <b-row class="p-px-2 mt-4 p-d-flex p-flex-wrap">
            <b-badge v-for="tag in tags_from_gitlab" variant="light" pill @click="handleFilterTags(tag)"
              :class="['m-1 cursor p-2', filteredTags.find(el => el === tag) && 'badge-active']">
              {{ tag }}
            </b-badge>
          </b-row>

          <b-button v-if="pagination <= tags.topics_from_gitlab.length" size="sm" pill
            @click="$event => isTruncated = !isTruncated" variant="light" class="mt-5">
            {{ isTruncated ? $t('read.less') : $t('read.more') }}
          </b-button>
        </div>
      </b-tab>

      <template #tabs-end>
        <b-nav-item class="bg-secondary p-ml-2" @click="handleResetTags">
         <span class=" text-white"> {{ $t("fields.tags.reset") }}</span>
        </b-nav-item>
      </template>
    </b-tabs>


  </div>
</template>


<script>
import { defineComponent } from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {CONNEXION_MODE} from "@/_Hub/tools/https";
import _ from "lodash";
import { mapState } from 'vuex';


export default defineComponent({
  name: "TagFilterComponent",
  components: { TextView },
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

    handleResetTags: {
      type: Function,
      required: true,
    },
    handleSelectStarredProject: {
      type: Function,
      required: true,
    },

  },
  data() {
    return {
      pagination: 30,
      isPreSelect: false,
      isTruncated: false,
      term_filter: null,
      only_starred_project:false,
    };
  },
  computed: {
    ...mapState(["auth"]),
    tags_from_gitlab() {
      return this.isTruncated ? this.tags.topics_from_gitlab : this.tags.topics_from_gitlab.slice(0, this.pagination);
    },
    filtered_section_tags() {
      const routeName = this.$route.name;
      if (routeName === "DynamicListSTAC") {
        const { pathMatch } = this.$route.params;
        return this.tags.sections.filter(el => el.enabled_for.includes(pathMatch));
      } else {
        return this.tags.sections;
      }
    },
    number_commontag_selected() {
      const _tags = _.flatten(this.filtered_section_tags.map(el => el.keywords));
      const els = this.filteredTags.filter(el => _tags.includes(el));
      return els.length;
    },
    number_others_tag_selected() {
      const els = this.filteredTags.filter(el => this.tags_from_gitlab.includes(el));
      return els.length;
    },
    isAuthenticated(){
      return [CONNEXION_MODE.PRIVATE_TOKEN,  CONNEXION_MODE.CONNECTED].includes( this.auth.mode);
    }

  },
  methods:{
      handleChangeToogle(boolean){
        this.only_starred_project=boolean;
        this.handleSelectStarredProject(boolean)
      }
  },
  beforeMount() {
    this.isPreSelect = this.tags.topics_from_gitlab.some(el => this.filteredTags.includes(el)) || this.filtered_section_tags.length === 0;
    const {starred} = this.$route.query;
    this.only_starred_project = !!starred;
  },
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
    padding: 0px !important;
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
  .bg-secondary{
    color:white !important;
    border-radius: 0.25rem;
    &:hover{
      opacity:0.85;
    }
  }

}
</style>
