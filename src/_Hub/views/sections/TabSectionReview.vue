<script>
import Vue, {defineComponent} from 'vue';
import {PROXY_URL} from "@/_Hub/Endpoint";

import Vssue, {VssueComponent} from "../../../../vendors-release/dist/vssue";
import '../../../../vendors-release/dist/vssue.css';
import GitlabV4 from "../../../../vendors-release/lib/index";

import {mapState} from "vuex";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import Utils from "@/utils";


Vue.use(Vssue);


const vsOptions = {
  api: GitlabV4,
  state: 'Vssue',
  labels: ['discussion', 'sharingHub'],
  prefix: 'Review -',
  admins: [],
  locale:"en",
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
    ...mapState(['data', 'uiLanguage', 'auth'])
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
          this.options.repo = Utils.getProjectID(data.id);
          this.options.clientId = this.auth.token;
          this.isLoading = false;
        }
      }
    },
     uiLanguage: {
        immediate: true,
        async handler(locale) {
          if (!locale) {
            return;
          }
          this.options = Object.assign(this.options, {locale : locale});
        }
      }
  },
  mounted() {
  },
  methods: {}
});
</script>


<template>
  <div class="w-100">
    <Awaiter v-if="isLoading" :is-visible="isLoading" />
    <Vssue :title="title" :options="options" v-else />
  </div>
</template>

<style scoped lang="scss">
.vssue, .markdown-body {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI" !important;
}

.vssue {
  a {
    color: red !important;
  }
}

</style>

