<template>
  <div>
    <div class="keywords d-flex flex-wrap">
      <b-badge v-for="(keyword, index) in keywords" :key="keyword" @click="filterByTags(keyword)"
               :variant="getRandomColor(index)" class="mr-1 mb-1 px-2 py-2 cursor">
        <b-icon v-if="!!getIcon(keyword)" font-scale="1.25"
                :icon="getIcon(keyword)"/>
        {{ keyword }}
      </b-badge>
      <b-badge v-if="!!license" variant="secondary" target="_blank"
               :href="extractHref(license.formatted)" class="mr-1 mb-1 px-2 py-2">
        <b-icon font-scale="1.25" icon="bank2"/>
        License : {{ license.value }}
      </b-badge>
      <b-badge v-if="!!doi" variant="light" target="_blank"
               :href="extractHref(doi.formatted)" class="mr-1 mb-1 px-2 py-2">
        <b-icon font-scale="1.25" icon="bank2"/>
        DOI : {{ doi.value }}
      </b-badge>
    </div>
    <div class="keywords d-flex flex-wrap">

    </div>
  </div>

</template>

<style lang="scss" scoped>
.badge {
  opacity: 0.8;
  transition: all linear 0.2s;

  &:hover {
    opacity: 1;
  }
}
</style>

<script>
import _ from "lodash";
import {mapState} from "vuex";
import {formatItemProperties,} from "@radiantearth/stac-fields";

export default {
  name: 'Keywords',
  props: {
    keywords: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      license: undefined,
      doi: undefined,
      ignoredMetadataFields: [
        'title',
        'description',
        'providers',
        // Will be rendered with a custom rendered
        'deprecated',
        // Don't show these complex lists of coordinates: https://github.com/radiantearth/stac-browser/issues/141
        'proj:bbox',
        'proj:geometry',
        // Special handling for the warning of the anonymized-location extension
        'anon:warning'
      ]
    };
  },
  computed: {
    ...mapState(['data', 'entriesRoute'])
  },
  beforeMount() {
    const dataFormatted = this.formatData();
    if (dataFormatted.length > 0) {
      const generalMetadata = dataFormatted.find(el => el.extension === "");
      this.license = generalMetadata.properties.license;
      const sciMetadata = dataFormatted.find(el => el.extension === "sci");
      if (sciMetadata) {
        this.doi = sciMetadata.properties["sci:doi"];
      }
    }


  },
  methods: {
    getRandomColor(index) {
      const colors = ["primary", "secondary", "success", "danger", "warning", "info", "dark"];
      return colors[index % colors.length];
    },
    getIcon(keyword = null) {
      function isMatching(matches, keyword) {
        return matches.some((el) => (keyword.toLowerCase().includes(el) > 0));
      }

      if (isMatching(["model", "text", "ai", "generation"], keyword)) {
        return "pencil-square";
      }
      if (isMatching(["test", "build", "ci"], keyword)) {
        return "shield-fill-check";
      }
      if (isMatching(["gitlab", "github"], keyword)) {
        return "github";
      }
      if (isMatching(["imagery", "view"], keyword)) {
        return "file-image";
      }
      if (isMatching(["data",], keyword)) {
        return "box-seam";
      }
      if (isMatching(["service", "application"], keyword)) {
        return "app-indicator";
      }

      if (isMatching(["sentinel", "callisto", "smap", "satellite"], keyword)) {
        return "flag";
      }
      return undefined;
    },

    formatData() {
      // Filter all fields as given in ignoreFields and also
      // ignore fields starting with an underscore which is likely originating from the STAC class
      let filter = key => !key.startsWith('_') && !this.ignoredMetadataFields.includes(key);
      return formatItemProperties(this.data, filter);
    },

    extractHref(text) {
      const regex = /<a href=\"(.*?)\".*>/g;
      const match = regex.exec(text);
      return match[1];
    },

    filterByTags(keyword) {
      const collection = this.$route.path.split("/")[3];
      this.$router.push({path: `/${collection}`, query: {topics: keyword,}});
    }

  }

};
</script>
