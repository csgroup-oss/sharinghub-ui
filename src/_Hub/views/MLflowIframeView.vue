<template>
  <div class="w-full h-full mlflow_iframe_view-component">
    <iframe id="mlflowIframe" class="w-full" :src="mlflow_uri" />
  </div>
</template>

<script>
import {mapState} from 'vuex';
import {CONNEXION_MODE} from '@/_Hub/tools/https';
import STAC from '@/models/stac';
export default {
  name: 'MLflowIframeView',
  components: {},
  props: {},
  data() {
    return {
      isAuthenticated: false,
      isLoading: false
    };
  },
  computed: {
    ...mapState(['data', 'auth']),
    mlflow_uri() {
      if (this.data instanceof STAC) {
        const link = this.data.getLinkWithRel('mlflow:tracking-uri', false);
        return link?.href;
      }
      return undefined;
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler() {
        this.isAuthenticated = [CONNEXION_MODE.PRIVATE_TOKEN, CONNEXION_MODE.CONNECTED].includes(this.auth.mode);
      }
    }
  }
};
</script>

<style scoped lang="scss">
.mlflow_iframe_view-component {
  iframe {
    min-height: 50rem;
    height: 100%;
  }
}
</style>
