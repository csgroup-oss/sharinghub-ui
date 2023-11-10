<script>
import Vue, {defineComponent} from 'vue';
import {PROXY_URL} from "@/_Hub/Endpoint";

import Vssue, {VssueComponent} from "../../../../vendors-release/dist/vssue";
import '../../../../vendors-release/dist/vssue.css';
import GitlabV4 from "../../../../vendors-release/lib/index";

import {mapState} from "vuex";
import Awaiter from "@/_Hub/components/Awaiter.vue";

Vue.use(Vssue);


const vsOptions = {
  api: GitlabV4,
  state: 'Vssue',
  labels: ['discussion', 'sharingHub'],
  prefix: 'Review -',
  admins: [],
  baseURL: PROXY_URL,
  issueContent: ({url}) => url,
  autoCreateIssue: true,
};

export default defineComponent({
  name: "TabSectionReview",
  components: {
    Awaiter,
    'Vssue': VssueComponent,
  },
  computed: {
    ...mapState(['data'])
  },
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
      isLoading: true,
      title: "SharingHUB",
      options: {
        ...vsOptions,
      },
    };
  },
  watch: {
    data: {
      immediate: true,
      handler(data) {
        this.isLoading = true;
        if (data) {
          this.options.repo = this.getProjectID(data._path);
          this.isLoading = false;
        }
      }
    }
  },
  mounted() {
  },
  methods: {
    getProjectID(url = "") {
      const reversed = url.split("/").reverse();
      if (reversed.length === 0) {
        return undefined;
      }
      return !isNaN(parseInt(reversed[0])) ? parseInt(reversed[0]) : undefined;
    }
  }
});
</script>


<template>
  <div class="w-100">
    <Awaiter v-if="isLoading" :is-visible="isLoading"/>
        <Vssue :title="title" :options="options" v-else />
  </div>
</template>

<style scoped lang="scss">

</style>

