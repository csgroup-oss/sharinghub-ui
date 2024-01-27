<template>
  <div class="share">

    <b-button-group size="sm">

      <template v-if="!action || action==='share' ">
        <b-button
          v-if="canUseJupyter"
          @click="$event => openJupyterLink($event, jupyter_link)"
          variant="outline-dark"
          size="sm"
          :disabled="!jupyter_link || !currentUser"
          v-b-tooltip
          :title="(!!currentUser) ? $t('source.jupyter.enabled') : $t('source.jupyter.disabled')"
        >
          <b-icon-terminal variant="warning"/>
          <TextView class="button-label" type="Small-1">
            <span class="button-label"> {{ $t("source.jupyter.open") }}</span>
          </TextView>
        </b-button>
        <b-button
          v-if="canUseDVC"
          id="popover-dvc-btn"
          variant="outline-dark"
          size="sm"
          :title="$t('source.dvc.hover')"
        >
          <b-icon-info-circle/>
          <TextView class="button-label" type="Small-1">
            <span class="button-label"> {{ $t('source.dvc.label') }} </span>
          </TextView>
        </b-button>
        <b-button size="sm" variant="outline-primary" id="popover-share-btn" :title="$t('source.share.withOthers')">
          <b-icon-share/>
          <TextView class="button-label" type="Small-1">
            <span class="button-label"> {{ $t('source.share.label') }}</span>
          </TextView>
        </b-button>
        <b-button :disabled="!can_rate" size="sm" @click="has_rated ?  UnStarProject() :starProject()"
                  variant="outline-primary">
          <b-icon :icon="has_rated ? 'star-fill' :'star'" scale="0.8" aria-hidden="true"></b-icon>
          <TextView type="Small-1" v-html="has_rated ? ' Unstar': ' Star'"></TextView>
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

    <b-popover v-if="canUseDVC" id="popover-dvc" target="popover-dvc-btn" triggers="focus" placement="bottom" :title="$t('source.dvc.title')">
      <Url id="dvcUrl" :url="dvcUrl()" :label="$t('source.dvc.description')" :open="false" />
      <hr>
      <b-button variant="primary" class="mr-1" href="https://dvc.org/doc" target="_blank">
        <b-icon-book />
        {{ $t('source.dvc.docs') }}
      </b-button>
      <b-button variant="secondary" :href="dvcDocsUrl" target="_blank">
        <b-icon-lightbulb />
        {{ $t('source.dvc.tutorial') }}
      </b-button>
    </b-popover>
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
import {CONNEXION_MODE, get, post} from "@/_Hub/tools/https";
import {DOCS_URL, PROXY_URL, STORE_DVC_URL} from "@/_Hub/Endpoint";


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
    },
    jupyter: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      can_rate: false,
      rank_rate: undefined,
      has_rated: false,
      jupyter_link: undefined,
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
    currentUser() {
      return !!this.auth.user && this.auth.mode !== CONNEXION_MODE.DEFAULT_TOKEN;
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
    dvcDocsUrl() {
      return DOCS_URL.concat("tutorials/manage_dataset_with_dvc/");
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
      for (let lang of this.dataLanguages) {
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
        for (let l of languages) {
          if (!l.ui) {
            l.ui = Boolean(getBest(uiSupported, l.code, null));
          }
          if (!l.data) {
            l.data = Boolean(getBest(dataSupported, l.code, null));
          }
        }
      }

      return languages.sort((a, b) => a.global.localeCompare(b.global, this.uiLanguage));
    },
    canUseJupyter() {
      if (this.auth?.mode === CONNEXION_MODE.DEFAULT_TOKEN) {
        return false;
      }
      return (this.stac != undefined) ? this.stac.getMetadata("sharinghub:jupyter") === "enable" : false;
    },
    canUseDVC() {
      return (this.stac != undefined) ? this.stac.getMetadata("sharinghub:store-s3") === "enable" : false
      && this.dvcUrl() != null;
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler(data) {
        this.jupyter_link = undefined;
        this.can_rate = false;
        if (data) {
          let projectID = Utils.getProjectID(data.id);
          get(PROXY_URL.concat(`projects/${projectID}/starrers`)).then((response) => {
            if (response.data) {
              this.rank_rate = response.data.length;
              if (this.currentUser) {
                this.can_rate = true;
                this.has_rated = !response.data.some(el => el.user.username === this.currentUser.username
                  || el.user.web_url === this.currentUser.web_url);
              }
            }
          });

          if (this.jupyter && this.canUseJupyter) {
            const notebooks = Object.values(this.data.assets).filter((el) => {
              return Utils.hasNotebookAsset(el.title);
            });
            let projectID = Utils.getProjectID(data.id);
            get(PROXY_URL.concat(`projects/${projectID}`)).then((res) => {
              if (res.data) {
                const {token} = this.auth;
                const {http_url_to_repo, default_branch} = res.data;
                const repo_url = new URL(http_url_to_repo);
                const repo_dir = repo_url.pathname.split("/").pop();
                let lab_path = `lab/tree/${repo_dir}`;
                if (notebooks.length > 0) {
                  lab_path = lab_path.concat(`/${notebooks[0].title}`);
                }
                this.jupyter_link = `${this.jupyter}/hub/user-redirect/git-pull?repo=${repo_url.protocol}//oauth2:${token}@${repo_url.host}${repo_url.pathname}&branch=${default_branch}&urlpath=${lab_path}`;
              }
            });
          }

        }
      },
    },
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
    dvcUrl() {
      let stac_id = this.data?.id;
      if (!stac_id) return null;
      const projectID = Utils.getProjectID(stac_id);
      if (!projectID) return null;
      return STORE_DVC_URL + projectID;
    },
    starProject() {
      let stac_id = this.data?.id;
      if (!stac_id) throw  new Error('stac_id is wrong');
      const projectID = Utils.getProjectID(stac_id);
      if (!projectID) throw new Error('Project is wrong');
      post(PROXY_URL.concat(`projects/${projectID}/star`))
        .then((response) => {
          if (response.data) {
            this.has_rated = true;
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
             this.rank_rate--;
             this.has_rated = false;
          }
        });

    },

    openJupyterLink(ev, url) {
      window.open(url, '_blank');
    },
  }
};
</script>

<style lang="scss">
#popover-link, #popover-root, #popover-share, #popover-dvc {
  width: 80%;
  max-width: 800px;

  .popover-body {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 80vh;
  }
}
#popover-dvc {
  max-width: 300px;
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
