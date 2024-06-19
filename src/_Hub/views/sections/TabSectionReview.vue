<template>
  <div class="w-100">
    <Awaiter v-if="isLoading" :is-visible="isLoading" />

    <text-view v-if="!currentUser" type="header__b16" class="text-primary ml-2">
      <router-link :to="login">
        {{ $t('fields.login') }}
      </router-link>
      {{ $t('comments.info_login') }}
    </text-view>
    <Vssue :title="title" :options="options" v-if="!isLoading" />
  </div>
</template>


<script>
import Vue, {defineComponent} from 'vue';
import {PROXY_URL} from '@/_Hub/Endpoint';

import Vssue, {VssueComponent} from '../../../../vendors-release/dist/vssue';
import '../../../../vendors-release/dist/vssue.css';
import GitlabV4 from '../../../../vendors-release/lib/index';

import {mapState} from 'vuex';
import Awaiter from '@/_Hub/components/Awaiter.vue';
import {CONNEXION_MODE} from '@/_Hub/tools/https';
import TextView from '@/_Hub/components/TextView.vue';


Vue.use(Vssue);


const vsOptions = {
  api: GitlabV4,
  state: 'Vssue',
  labels: ['discussion', 'sharingHub'],
  prefix: 'Review -',
  admins: [],
  locale: 'en',
  baseURL: PROXY_URL,
  issueContent: ({url}) => url,
  autoCreateIssue: true
};

export default defineComponent({
  name: 'TabSectionReview',
  components: {
    TextView,
    Awaiter,
    'Vssue': VssueComponent
  },
  computed: {
    ...mapState(['data', 'uiLanguage', 'auth']),
    currentUser() {
      return !!this.auth.user && this.auth.mode !== CONNEXION_MODE.DEFAULT_TOKEN;
    },
    login() {
      const { path } = this.$route;
      const base_login =  path ? '/login?redirect='.concat(path.substring(1)) : '/login';
      return base_login;
    }
  },
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
      isLoading: true,
      title: 'SharingHub',
      options: {
        ...vsOptions
      },
      refreshTimeout:null
    };
  },
  watch: {
    data: {
      immediate: true,
      handler(data) {
        this.isLoading = true;
        clearTimeout(this.refreshTimeout);
        if (data) {
          this.refreshTimeout = setTimeout(() => {
            this.options = Object.assign(this.options, {
              repo: data.properties['sharinghub:id'],
              clientId: this.auth.token
            });
            this.isLoading = false;
          }, 250);
        }
      }
    },
    uiLanguage: {
      immediate: true,
      async handler(locale) {
        if (!locale) {
          return;
        }
        this.options = Object.assign(this.options, {locale: locale});
      }
    }
  },
  methods: {}
});
</script>

<style scoped lang="scss">
@import "../../../theme/variables.scss";
.vssue, .markdown-body {
  font-family: $font-family-sans-serif;
}

.vssue {
  a {
    color: red !important;
  }
}

</style>
