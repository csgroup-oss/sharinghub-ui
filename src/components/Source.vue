<template>
  <div class="share">

    <b-button-group size="sm">

      <template v-if="!action || action==='share' ">
        <b-button v-if="!!notebook_data" size="sm" @click="$event => openJupyterLink($event, notebook_data.notebook_link)" variant="outline-dark" id="popover-share-btn">
          <b-icon-terminal variant="warning"/>
          <TextView class="button-label" type="Small-1">
            <span class="button-label"> Jupyter Notebook</span>
          </TextView>
        </b-button>
        <b-button size="sm" variant="outline-primary" id="popover-share-btn" :title="$t('source.share.withOthers')">
          <b-icon-share/>
          <TextView class="button-label" type="Small-1">
            <span class="button-label"> {{ $t('source.share.label') }}</span>
          </TextView>
        </b-button>
        <b-button size="sm" @click="can_rate ? starProject() : UnStarProject()" variant="outline-primary">
          <b-icon :icon="can_rate ? 'star' : 'star-fill'" scale="0.8" aria-hidden="true"></b-icon>
          <TextView type="Small-1" v-html="can_rate ? ' Star' : ' Unstar'"></TextView>
        </b-button>
        <b-button size="sm" disabled variant="outline-dark"> {{ rank_rate }}</b-button>
      </template>


      <b-dropdown v-if="!action || action==='language' " size="sm" variant="outline-primary" right
                  :title="$t('source.language.switch')">
        <template #button-content>
          <b-icon-flag/>
          <span class="button-label">{{ $t('source.language.label', {currentLanguage}) }}</span>
        </template>
        <b-dropdown-item
          v-for="l of languages" :key="l.code" class="lang-item"
          @click="switchLocale({locale: l.code, userSelected: true})"
        >
          <b-icon-check v-if="locale === l.code"/>
          <b-icon-blank v-else/>
          <span class="title">
            {{ l.native }}
            <template v-if="l.global && l.global !== l.native"> / {{ l.global }}</template>
          </span>
          <b-icon-exclamation-triangle v-if="supportsLanguageExt && (!l.ui || !l.data)"
                                       :title="l.ui ? $t('source.language.onlyUI') : $t('source.language.onlyData')"
                                       class="ml-2"/>
        </b-dropdown-item>
      </b-dropdown>

    </b-button-group>

    <b-popover id="popover-share" target="popover-share-btn" triggers="focus" placement="bottom"
               container="stac-browser" :title="$t('source.share.title')">
      <Url id="browserUrl" :url="browserUrl()" :label="$t('source.share.sharePageWithOthers')" :open="false"/>
      <hr>
      <b-button class="twitter mr-1" :href="twitterUrl">
        <b-icon-twitter/>
        {{ $t('source.share.twitter') }}
      </b-button>
      <b-button variant="dark" :href="mailTo">
        <b-icon-envelope/>
        {{ $t('source.share.email') }}
      </b-button>
    </b-popover>
  </div>
</template>

<script>
import {BDropdown, BDropdownItem} from 'bootstrap-vue';
import {mapActions, mapGetters, mapState} from 'vuex';

import Url from './Url.vue';
import URI from 'urijs';
import Utils from '../utils';
import {getBest, prepareSupported} from '../locale-id';
import TextView from "@/_Hub/components/TextView.vue";
import {get, post} from "@/_Hub/tools/https";
import {PROXY_URL} from "@/_Hub/Endpoint";
import config from "@/config";


const LANGUAGE_EXT = 'https://stac-extensions.github.io/language/v1.*/schema.json';

export default {
  name: "Source",
  components: {
    TextView,
    BDropdown,
    BDropdownItem,
    Url,
  },
  props: {
    title: {
      type: String,
      required: true
    },
    stacUrl: {
      type: String,
      default: null
    },
    stac: {
      type: Object,
      default: null
    },
    action: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      can_rate: false,
      rank_rate: undefined,
      has_rank: false,
      notebook_data: undefined,
    };
  },
  computed: {
    ...mapState(['conformsTo', 'dataLanguages', 'locale', 'data', 'auth', 'privateQueryParameters', 'supportedLocales', 'stacLint', 'stacProxyUrl', 'uiLanguage', 'valid']),
    ...mapGetters(['supportsExtension', 'root']),
    stacVersion() {
      return this.stac?.stac_version;
    },
    stacId() {
      return this.stac?.id;
    },
    showRoot() {
      if (!this.root) {
        return false;
      }
      return (Array.isArray(this.conformsTo) && this.conformsTo.length > 0)
        || Utils.isObject(this.root['stats:collections'])
        || Utils.isObject(this.root['stats:catalogs'])
        || Utils.isObject(this.root['stats:items']);
    },
    rootTitle() {
      return Array.isArray(this.conformsTo) && this.conformsTo.length > 0 ? this.$t('index.api') : this.$t('index.catalog');
    },
    currentLanguage() {
      let lang = this.languages.find(l => l.code === this.locale);
      if (lang) {
        return lang.native;
      } else {
        return '-';
      }
    },
    canValidate() {
      if (!this.stacLint || typeof this.stacUrl !== 'string') {
        return false;
      } else if (Utils.size(this.privateQueryParameters) > 0) {
        // Don't expose private query parameters to externals
        return false;
      } else if (Array.isArray(this.stacProxyUrl)) {
        // Don't validate if a proxy has been set
        return false;
      }
      let uri = URI(this.stacUrl);
      let host = uri.hostname().toLowerCase();
      if (host === 'localhost' || host.startsWith('127.') || host === '::1') {
        // Can't validate localhost
        return false;
      }
      return true;
    },
    message() {
      return this.$t('source.share.message', {title: this.title, url: this.browserUrl()});
    },
    twitterUrl() {
      let text = encodeURIComponent(this.message);
      return `https://twitter.com/intent/tweet?text=${text}`;
    },
    mailTo() {
      let title = encodeURIComponent(this.title);
      let text = encodeURIComponent(this.message);
      return `mailto:?subject=${title}&body=${text}`;
    },
    supportsLanguageExt() {
      return this.supportsExtension(LANGUAGE_EXT);
    },
    languages() {
      let languages = [];

      // Add all UI languages
      for (let code of this.supportedLocales) {
        languages.push({
          code,
          native: this.$t(`languages.${code}.native`),
          global: this.$t(`languages.${code}.global`),
          ui: true
        });
      }

      // Add missing data languages
      for(let lang of this.dataLanguages) {
        if (!Utils.isObject(lang) || !lang.code || this.supportedLocales.includes(lang.code)) {
          continue;
        }
        let newLang = {
          code: lang.code
        };
        newLang.native = lang.name || lang.alternate || lang.code;
        newLang.global = lang.alternate || lang.name || lang.code;
        newLang.data = true;
        languages.push(newLang);
      }

      if (this.supportsExtension(LANGUAGE_EXT)) {
        // Determine which languages are complete
        const uiSupported = prepareSupported(this.supportedLocales);
        const dataSupported = prepareSupported(this.dataLanguages.map(l => l.code));
        for(let l of languages) {
          if (!l.ui) {
            l.ui = Boolean(getBest(uiSupported, l.code, null));
          }
          if (!l.data) {
            l.data = Boolean(getBest(dataSupported, l.code, null));
          }
        }
      }

      return languages.sort((a,b) => a.global.localeCompare(b.global, this.uiLanguage));
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler(data) {
        this.notebook_data = undefined;
        if (data) {
          let projectID = Utils.getProjectID(data.id);
          get(PROXY_URL.concat(`projects/${projectID}/starrers`)).then((response) => {
              if (response.data) {
                this.rank_rate = response.data.length;
                const currentUser = this.$store.state.auth.user;
                this.can_rate = !response.data.some(el => el.user.username === currentUser.username
                  || el.user.web_url === currentUser.web_url);
              }
            });

          get(PROXY_URL.concat(`projects/${projectID}`)).then((res) => {
            if (res.data) {
              Object.entries(data.assets).forEach(([, value]) => {
                if (Utils.hasNotebookAsset(value.title)) {
                  const {token} = this.auth;
                  let {ssh_url_to_repo, default_branch} = res.data;
                  const prefix_gitlab_url = ssh_url_to_repo.split(':')[0].substring(4);
                  ssh_url_to_repo = ssh_url_to_repo.split(':')[1];
                  const nb_project_name = ssh_url_to_repo.split('/').reverse()[0].concat('/').concat(value.title).concat(`&branch=${default_branch}`);
                  let link = `${config.notebookGitPullerURL}?repo=https://oauth2:${token}@${prefix_gitlab_url}/${ssh_url_to_repo}&urlpath=lab/tree/${nb_project_name}`;

                  this.notebook_data = Object.assign(value , {notebook_link  : link});
                }
              });
            }
          });
        }
      }
    }
  },
  methods: {
    ...mapActions(['switchLocale']),
    async validate() {
      if (!this.canValidate) {
        return;
      }
      await this.$store.dispatch('validate', this.stacUrl);
    },
    browserUrl() {
      return window.location.toString();
    },
    starProject() {
      let stac_id = this.data?.id;
      if (!stac_id) throw  new Error('stac_id is wrong');
      const projectID = Utils.getProjectID(stac_id);
      if (!projectID) throw new Error('Project is wrong');
      post(PROXY_URL.concat(`projects/${projectID}/star`))
        .then((response) => {
          if (response.data) {
            this.can_rate = false;
            this.rank_rate++;
          }
        });
    },
    UnStarProject() {
      let stac_id = this.data?.id;
      if (!stac_id) throw  new Error('stac_id is wrong');
      const projectID = Utils.getProjectID(stac_id);
      if (!projectID) throw new Error('Project is wrong');
      post(PROXY_URL.concat(`projects/${projectID}/unstar`))
        .then((response) => {
          if (response.data) {
            this.can_rate = true;
            this.rank_rate--;
          }
        });
    },

    openJupyterLink(ev, url){
      window.open(url, '_blank');
    }
  }
};
// https://nb.p2.csgroup.space/hub/user-redirect/git-pull?repo=https://oauth2:<access-token>@gitlab.si.c-s.fr/space_applications/mlops-services/sharinghub-tests/challenge-sample.git&urlpath=lab/tree/challenge-sample.git/notebooks/sample.ipynb&branch=main
// https://nb.p2.csgroup.space/hub/user-redirect/git-pull?repo=https://oauth2:<access-token>@gitlab.si.c-s.fr/space_applications/mlops-services/sharinghub-tests/challenge-sample.git&urlpath=lab/tree/challenge-sample.git/sample.ipynb&branch=main
</script>

<style lang="scss">
#popover-link, #popover-root, #popover-share {
  width: 80%;
  max-width: 800px;

  .popover-body {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 80vh;
  }
}

#popover-link .stac-id .copy-button {
  padding-top: 0.1rem;
  padding-bottom: 0.1rem;
  font-size: 0.7rem;
}

</style>
<style lang="scss" scoped>
.lang-item > .dropdown-item {
  display: flex;

  > .title {
    flex: 1;
  }
}
</style>
