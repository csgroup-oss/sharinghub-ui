<template>
  <div class="p-d-flex p-flex-wrap p-ai-center w-100 tag-filter">

    <b-row class="p-d-flex p-flex-wrap p-jc-center w-100">
      <div class="overflow-auto mt-3">
        <b-pagination
          size="sm" pills
          limit="3"
          v-model="currentPage"
          :per-page="perPage"
          :total-rows="topics.length"
          aria-controls="filter-element"
        >

        </b-pagination>
      </div>
    </b-row>
    <b-row  id="filter-element" class="p-d-flex p-flex-wrap w-100">
      <b-badge v-for="topic in paginationCurrentItems" variant="light" pill @click="handleFilterTopic(topic)"
               :class="['m-1 cursor p-2', filteredTopic.find(el => el.name === topic.name) && 'active']">
        {{ topic.title }}
      </b-badge>
    </b-row>

  </div>
</template>


<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: "TagFilterComponent",
  props: {
    topics: {
      type: [Array],
      required: true
    },
    filteredTopic: {
      type: [Array],
      required: true
    },
    handleFilterTopic: {
      type: Function,
      required: true
    },

  },
  data() {
    return {
      currentPage: 1,
      perPage: 30,
    };
  },
  computed: {
    paginationCurrentItems() {
      const startIndex = (this.currentPage - 1) * this.perPage;
      const endIndex = startIndex + this.perPage;
      return this.topics.slice(startIndex, endIndex);
    }
  },
  mounted() {
  },
  methods: {
  }
});
</script>

<style scoped lang="scss">
@import "../../assets/colors";
@import "../../theme/variables";

.tag-filter {
  width: 100%;
  border-radius: 12px;
  background: linear-gradient(90deg, #FFFFFF, rgba(#129E83, 0.032));

  .badge {
    //background-color: rgba($secondary-color,1) !important;
    border: 1px rgba($secondary-color, 1) solid;
  }

  .active {
    color: #FFFFFF;
    background-color: map-get($theme-colors, "primary") !important;
  }
}
</style>
