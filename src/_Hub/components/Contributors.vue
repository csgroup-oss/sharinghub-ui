<template>
  <div class="w-full flex-column align-items-start">
    <h2>{{ $t('fields.contributors') }}</h2>

    <div class="my-3 mx-1 flex flex-wrap align-items-center">
      <contributor class="mx-2" v-for="(ct, idx) in contributors" :name="ct.name" :key="idx" />
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import {get} from '@/_Hub/tools/https';
import {PROXY_URL} from '@/_Hub/Endpoint';
import {mapState} from 'vuex';
import STAC from '@/models/stac';
import Contributor from '@/_Hub/components/Contributor.vue';

export default defineComponent({
  name: 'Contributors',
  components: {Contributor},
  props: {},
  data() {
    return {
      contributors: []
    };
  },
  computed: {
    ...mapState(['data'])
  },
  async mounted() {
    if (this.data instanceof STAC) {
      const projectID = this.data.getMetadata('sharinghub:id');
      this.contributors = await this.getContributors(projectID);
    }
  },
  methods: {
    getContributors(project_id) {
      return get(`${PROXY_URL}projects/${project_id}/contributors`)
        .then((response) => {
          if (response.data) {
            return response.data;
          }
        });
    }
  }
});
</script>

<style scoped lang="scss">

</style>
