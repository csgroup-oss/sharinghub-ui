<template>
  <div class="share">
    <b-button-group
      size="md"
      class="mx-2
      btn-group-code-generator sm:hidden
      md:hidden
      lg:inline-flex xl:inline-flex"
    >
      <template>
        <b-button
          variant="outline-secondary"
          size="sm"
          id="popover-stac-btn"
          :title="$t('source.stac.hover')"
        >
          <img :src="stacLogo" width="35">
          <TextView class="button-label" type="Small-1">
            <span class="button-label">STAC</span>
          </TextView>
        </b-button>
        <b-popover
          id="popover-stac" target="popover-stac-btn"
          triggers="focus" placement="bottom"
          container="stac-browser"
        >
          <STACCodeGenerator />
        </b-popover>
      </template>

      <template>
        <b-button
          v-if="canUseDVC"
          id="popover-dvc-btn"
          variant="outline-secondary"
          size="sm"
          :title="$t('source.dvc.hover')"
        >
          <TextView class="button-label" type="Small-1">
            <img width="30" :src="dvcLogo">
          </TextView>
        </b-button>
        <b-popover v-if="canUseDVC" id="popover-dvc" target="popover-dvc-btn" triggers="focus" placement="bottom">
          <DVCCodeGenerator :dvc-url="dvcUrl()" :label="$t('source.dvc.description')" />
        </b-popover>
      </template>

      <template v-if="canUseMlflow">
        <b-button
          id="popover-mlflow-btn"
          variant="outline-secondary"
          size="sm"
          :title="$t('source.mlflow.hover')"
        >
          <TextView class="button-label" type="Small-1">
            <img width="50" :src="mlflowLogo">
          </TextView>
        </b-button>
        <b-popover id="popover-mlflow" target="popover-mlflow-btn" triggers="focus" placement="bottom">
          <MLflowCodeGenerator :mlflow-url="mlflowUrl()" />
        </b-popover>
      </template>

      <b-button
        v-if="canUseJupyter"
        @click="$event => openJupyterLink($event, jupyter_link)"
        variant="outline-dark"
        size="sm"
        :disabled="!jupyter_link || !currentUser"
        v-b-tooltip
        :title="(!!currentUser) ? $t('source.jupyter.enabled') : $t('source.jupyter.disabled')"
      >
        <img :src="jupyterLogo" width="17" alt="jupyter_logo">
        <TextView class="button-label" type="Small-1">
          <span class="button-label">&nbsp;{{ $t("source.jupyter.open") }}</span>
        </TextView>
      </b-button>
    </b-button-group>

    <b-button-group size="md">
      <template>
        <template>
          <b-button size="sm" variant="outline-primary" id="popover-share-btn" :title="$t('source.share.withOthers')">
            <b-icon-share />
            <TextView class="button-label" type="Small-1">
              <span class="button-label"> {{ $t('source.share.label') }}</span>
            </TextView>
          </b-button>
          <b-popover
            id="popover-share" target="popover-share-btn" triggers="focus" placement="bottom"
            container="stac-browser" :title="$t('source.share.title')"
          >
            <Url id="browserUrl" :url="browserUrl()" :label="$t('source.share.sharePageWithOthers')" :open="false" />
            <hr>
            <b-button class="twitter mr-1" :href="twitterUrl">
              <b-icon-twitter />
              {{ $t('source.share.twitter') }}
            </b-button>
            <b-button variant="dark" :href="mailTo">
              <b-icon-envelope />
              {{ $t('source.share.email') }}
            </b-button>
          </b-popover>
        </template>

        <b-button
          :disabled="!can_rate" size="sm" @click="has_rated ? UnStarProject() :starProject()"
          variant="outline-primary"
        >
          <b-icon :icon="has_rated ? 'star-fill' :'star'" scale="0.8" aria-hidden="true" />
          <TextView type="Small-1" v-html="has_rated ? ' Unstar': ' Star'" />
        </b-button>
        <b-button size="sm" disabled variant="outline-dark">
          {{ rank_rate }}
        </b-button>
      </template>
    </b-button-group>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

import Url from './Url.vue';
import URI from 'urijs';
import Utils from '../utils';
import {getBest, prepareSupported} from '../locale-id';
import TextView from '@/_Hub/components/TextView.vue';
import {CONNEXION_MODE, get, post} from '@/_Hub/tools/https';
import {PROXY_URL, STORE_DVC_URL} from '@/_Hub/Endpoint';
import STAC from '../models/stac';
import STACLogo from '@/assets/img/STAC_logo.png';
import DVCLogo from '@/assets/img/logo-dvc.svg';
import MLFlowLogo from '@/assets/img/MLflow-Logo.svg';
import JupyterLogo from '@/assets/img/Jupyter_logo.svg';
import DVCCodeGenerator from '@/_Hub/components/CodeGenerator/DVCCodeGenerator.vue';
import STACCodeGenerator from '@/_Hub/components/CodeGenerator/STACCodeGenerator.vue';
import MLflowCodeGenerator from '@/_Hub/components/CodeGenerator/MLflowCodeGenerator.vue';


const LANGUAGE_EXT = 'https://stac-extensions.github.io/language/v1.*/schema.json';

export default {
  name: 'Source',
  components: {
    MLflowCodeGenerator,
    STACCodeGenerator,
    DVCCodeGenerator,
    TextView,
    Url
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
      stacLogo:STACLogo,
      dvcLogo:DVCLogo,
      mlflowLogo:MLFlowLogo,
      jupyterLogo:JupyterLogo

    };
  },
  computed: {
    ...mapState(['conformsTo', 'dataLanguages', 'locale', 'data', 'auth', 'provideConfig', 'privateQueryParameters', 'supportedLocales', 'stacLint', 'stacProxyUrl', 'uiLanguage', 'valid']),
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
      if(this.stac){
        const {jupyterlab} = this.provideConfig;
        if(!jupyterlab.url){
          return  null;
        }
        return this.stac?.getMetadata('sharinghub:jupyter') === 'enable';
      }
      return false;
    },
    canUseDVC() {
      return this.dvcUrl() !== null;
    },
    canUseMlflow() {
      if(!this.mlflowUrl()){
        return false;
      }
      if(this.stac){
        return  this.stac?.getMetadata('sharinghub:mlflow') === 'enable';
      }
      return false;
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler(data) {
        this.jupyter_link = undefined;
        this.can_rate = false;
        if (data) {
          let projectID =  data.getMetadata('sharinghub:id');
          get(PROXY_URL.concat(`projects/${projectID}/starrers`)).then((response) => {
            if (response.data) {
              this.rank_rate = response.data.length;
              if (this.currentUser) {
                this.can_rate = true;
                if(response.data.length===0){
                  this.has_rated = false;
                }else{
                  const {user} = this.auth;
                  const my_rate = response.data.find( el => el.user.username === user.username || el.user.web_url === user.web_url );
                  this.has_rated = !!my_rate;
                }

              }
            }
          });

          if (this.jupyter && this.canUseJupyter) {

            const notebooks = Object.values(this.data.assets).map(el => {
              const {pathname} = new URL(el.href);
              return pathname;
            }).filter((el) => {
              return Utils.hasNotebookAsset(el || '');
            });
            let projectID = data.getMetadata('sharinghub:id');
            get(PROXY_URL.concat(`projects/${projectID}`)).then((res) => {
              if (res.data) {
                const {token} = this.auth;
                const {http_url_to_repo, default_branch, namespace : {full_path}} = res.data;
                const repo_url = new URL(http_url_to_repo);
                let lab_path ='';
                if (notebooks.length > 0) {
                  const notebook_path = this.extractNotebookfile(full_path, notebooks[0]);
                  lab_path = notebook_path ? lab_path.concat(`&subpath=${notebook_path}`) : lab_path;
                }
                this.jupyter_link = `${this.jupyter}/hub/user-redirect/git-pull?repo=${repo_url.protocol}//oauth2:${token}@${repo_url.host}${repo_url.pathname}&branch=${default_branch}&app=lab${lab_path}`;
              }
            });
          }

        }
      }
    }
  },
  methods: {
    ...mapActions(['switchLocale']),
    browserUrl() {
      return window.location.toString();
    },
    dvcUrl() {
      const {store} = this.provideConfig;
      if (!this.data || !(this.data instanceof STAC)) {return null;}
      const projectID = this.data.getMetadata('sharinghub:id');
      if (!projectID || !store) {return null;}
      return STORE_DVC_URL + projectID;
    },
    mlflowUrl() {
      if (!this.data || !(this.data instanceof STAC)) {return null;}
      const {mlflow} = this.provideConfig;
      const projectPath = this.data.getMetadata('sharinghub:path');
      if (!projectPath || (!mlflow.url)) {return null;}
      return mlflow.url.endsWith('/') ?  mlflow.url.concat(projectPath).concat('/tracking') :
        mlflow.url.concat(`/${projectPath}`).concat('/tracking');
    },
    starProject() {
      if (!this.data || !(this.data instanceof STAC)) {throw  new Error('STAC is not defined');}
      const projectID = this.data.getMetadata('sharinghub:id');
      if (!projectID) {throw new Error('project is wrong');}
      post(PROXY_URL.concat(`projects/${projectID}/star`))
        .then((response) => {
          if (response.data) {
            this.has_rated = true;
            this.rank_rate++;
          }
        });
    },
    UnStarProject() {
      if (!this.data || !(this.data instanceof STAC)) {throw  new Error('STAC is not defined');}
      const projectID = this.data.getMetadata('sharinghub:id');
      if (!projectID) {throw new Error('project id is wrong');}
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
    extractNotebookfile(full_path, download_path){
      const truth_path = download_path.replace(`${full_path}/`, '');
      const index =  truth_path.indexOf('repository');
      if(index){
        return truth_path.substring(index).split('/').splice(1).join('/');
      }
      return undefined;
    }
  }
};
</script>

<style lang="scss">
@import 'src/theme/variables';
@import 'src/assets/mixins';
#popover-link, #popover-root, #popover-share, #popover-dvc, #popover-stac, #popover-dvc, #popover-mlflow {
  width: 50%;
  max-width: 70%;
  padding-top: 8px;
  .popover-body {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 80vh;
    @include scrollbars(0.6em, map-get($theme-colors, 'primary'));
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
.btn-group{
  .btn{
    height: 38px !important;
  }
}
.btn-group-code-generator{
  .btn{
    min-width: 65px;
    display: flex !important;
    justify-content: center;
    align-items: center;
  }
}
@media screen and (max-width: 575px) {
  .sm\:{
    &hidden{
      display: none !important;
    }
    &block{
      display: block !important;
    }
  }
}
</style>
