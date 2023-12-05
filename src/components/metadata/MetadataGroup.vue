<template>
  <b-card no-body :key="extension" :class="['metadata-card', `ext-${extension}`]">
    <b-card-title>
      <span v-if="label" v-html="label" />
      <template v-else>{{ $t('metadata.general') }}</template>
    </b-card-title>
    <section class="border metadata-rows">
      <MetadataEntry v-for="(entry, key) in ignoreMetadata()" v-bind="entry" :field="key" :key="key" />
    </section>
  </b-card>
</template>

<script>
import MetadataEntry from './MetadataEntry.vue';

export default {
  name: "MetadataGroup",
  components: {
    MetadataEntry
  },
  props: {
      label: {
        type: String,
        default: ''
      },
      extension: {
        type: String,
        default: ''
      },
      properties: {
        type: Object,
        required: true
      }
  },
  methods : {
    ignoreMetadata(){
      const blackList = ["keywords", "license", "sci:doi", 'long_title'];
      let data = {};
      if(this.properties){
        Object.entries(this.properties).forEach(([key, value]) =>{
         if(!blackList.includes(key)){
          data = {...data,
          [key] : value
          };
        }
      });
      return data;
      }
    }
  }
};
</script>
