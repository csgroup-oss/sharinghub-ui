<template>
  <div class="flex flex-column flex-wrap w-100 tag-filter">
    <b-tabs small pills size="sm" class="lg:block sm:hidden">
      <b-tab :active="!isPreSelect">
        <template #title>
          {{ $t('fields.tags.common_tag') }} <b-badge v-if="number_commontag_selected !== 0" variant="light">
            {{
              number_commontag_selected }}
          </b-badge>
        </template>
        <div v-for="(key, idx) in filtered_section_tags" :key="idx" class="block mb-3 mt-4">
          <div class="block">
            <text-view class="text-primary" type="header__14"> {{ key.name }}</text-view>
            <div class="flex flex-wrap align-items-center mx-2 mt-2">
              <b-badge
                v-for="tag in key.keywords"
                :key="tag"
                variant="light" pill @click="handleFilterTags(tag)"
                :class="['m-1 cursor p-2', filteredTags.find(el => el === tag) && 'badge-active']"
              >
                {{ tag }}
              </b-badge>
            </div>
          </div>
        </div>
      </b-tab>
      <b-tab v-if="topics_from_gitlab.length !== 0" :active="isPreSelect">
        <template #title>
          {{ $t('fields.tags.others') }} <b-badge v-if="number_others_tag_selected !== 0" variant="light">
            {{
              number_others_tag_selected }}
          </b-badge>
        </template>
        <div class="flex flex-column align-items-center">
          <b-row class="px-2 mt-4 flex flex-wrap">
            <b-badge
              v-for="tag in tags_from_gitlab" variant="light"
              :key="tag"
              pill @click="handleFilterTags(tag)"
              :class="['m-1 cursor p-2', filteredTags.find(el => el === tag) && 'badge-active']"
            >
              {{ tag }}
            </b-badge>
          </b-row>

          <b-button
            v-if="show_more" size="sm" pill
            @click="$event => isTruncated = !isTruncated" variant="light" class="mt-5"
          >
            {{ isTruncated ? $t('read.less') : $t('read.more') }}
          </b-button>
        </div>
      </b-tab>
      <template v-if="filteredTags.length!==0" #tabs-end>
        <b-button
          size="sm"
          v-b-tooltip.hover.topright :title="$t('fields.tags.reset')"
          class="reset ml-2" @click="handleResetTags"
        >
          <b-icon class="text-white" icon="x" />
        </b-button>
      </template>
    </b-tabs>

    <b-button
      block variant="primary" class="mb-3 sm:block lg:hidden"
      @click="$bvModal.show('bv-modal-filter')"
    >
      <b-icon icon="funnel-fill" />
      {{ $t('fields.tags.add_filter') }}
      <b-badge v-if="number_filters !== 0" variant="light">
        {{
          number_filters }}
      </b-badge>
    </b-button>

    <b-modal id="bv-modal-filter" hide-footer>
      <template #modal-title>
        {{ $t('fields.tags.add_filter') }}
      </template>
      <b-tabs small pills size="sm">
        <b-tab :active="!isPreSelect">
          <template #title>
            {{ $t('fields.tags.common_tag') }} <b-badge v-if="number_commontag_selected !== 0" variant="light">
              {{
                number_commontag_selected }}
            </b-badge>
          </template>
          <div
            v-for="(key, idx) in filtered_section_tags"
            :key="idx"
            class="block mb-3 mt-4"
          >
            <div class="block">
              <text-view class="text-primary" type="header__14"> {{ key.name }}</text-view>
              <b-row class="ml-1 mt-2">
                <b-badge
                  v-for="tag in key.keywords"
                  :key="tag"
                  variant="light" pill @click="handleFilterTags(tag)"
                  :class="['m-1 cursor p-2', filteredTags.find(el => el === tag) && 'badge-active']"
                >
                  {{ tag }}
                </b-badge>
              </b-row>
            </div>
          </div>
        </b-tab>
        <b-tab :active="isPreSelect">
          <template #title>
            {{ $t('fields.tags.others') }} <b-badge v-if="number_others_tag_selected !== 0" variant="light">
              {{
                number_others_tag_selected }}
            </b-badge>
          </template>
          <div class="flex flex-column align-items-center">
            <b-row class="px-2 mt-4 flex flex-wrap">
              <b-badge
                v-for="tag in tags_from_gitlab"
                :key="tag"
                variant="light" pill @click="handleFilterTags(tag)"
                :class="['m-1 cursor p-2', filteredTags.find(el => el === tag) && 'badge-active']"
              >
                {{ tag }}
              </b-badge>
            </b-row>

            <b-button
              v-if=" show_more" size="sm" pill
              @click="$event => isTruncated = !isTruncated" variant="light" class="mt-5"
            >
              {{ isTruncated ? $t('read.less') : $t('read.more') }}
            </b-button>
          </div>
        </b-tab>

        <template v-if="filteredTags.length!==0" #tabs-end>
          <b-button
            size="sm"
            v-b-tooltip.hover.topright :title="$t('fields.tags.reset')"
            class="reset ml-2" @click="handleResetTags"
          >
            <b-icon class="text-white" icon="x" />
          </b-button>
        </template>
      </b-tabs>
      <b-button
        size="sm" class="mt-3" variant="primary"
        block @click="$bvModal.hide('bv-modal-filter')"
      >
        {{ $t('leaflet.close') }}
      </b-button>
    </b-modal>
  </div>
</template>


<script>
import { defineComponent } from 'vue';
import TextView from '@/_Hub/components/TextView.vue';
import _ from 'lodash';
import { mapState } from 'vuex';


export default defineComponent({
  name: 'TagFilterComponent',
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
      required: true
    }

  },
  data() {
    return {
      pagination: 30,
      isPreSelect: false,
      isTruncated: false,
      term_filter: null,
      only_starred_project:false
    };
  },
  computed: {
    ...mapState(['auth']),
    topics_from_gitlab(){
      return this.tags?.topics_from_gitlab || [];
    },
    tags_from_gitlab() {
      if(this.topics_from_gitlab){
        return this.isTruncated ? this.topics_from_gitlab : this.topics_from_gitlab.slice(0, this.pagination);
      }
      return [];
    },

    filtered_section_tags() {
      const routeName = this.$route.name;
      if (routeName === 'DynamicListSTAC') {
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
    number_filters(){
      return this.number_commontag_selected + this.number_others_tag_selected;
    },
    show_more(){
      if(this.topics_from_gitlab){
        return  this.pagination <= this.topics_from_gitlab.length;
      }
      return false;
    }
  },
  beforeMount() {
    if(this.tags?.topics_from_gitlab){
      this.isPreSelect = this.tags?.topics_from_gitlab?.some(el => this.filteredTags.includes(el)) || this.filtered_section_tags.length === 0;
    }
  }
});
</script>

<style scoped lang="scss">
@import "../../assets/colors";
@import "../../theme/variables";
@mixin tags-style{
  .badge {
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

#bv-modal-filter{
  @include tags-style;
}

.tag-filter {
  min-height: 100%;
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(90deg, #FFFFFF, rgba(#129E83, 0.032));
  .nav-pills {
    align-items: center !important;
  }
  @include tags-style;

  .lg\:{
    &block{
      display:block;
    }
    &hidden{
      display:none;
    }

  }

}

@media screen and (max-width: 575px) {
  .sm\:{
    &block{
      display:block !important;
    }
    &hidden{
      display:none !important;
    }

  }
}
</style>
