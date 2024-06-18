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
    </b-button-group>

    <b-button-group
      size="md"
      class="mx-2
      btn-group-code-generator sm:hidden
      md:hidden
      lg:inline-flex xl:inline-flex"
    >
      <template>
        <b-button
          v-if="canUseJupyter"
          @click="$event => openJupyterLink($event, jupyterUrl)"
          variant="outline-dark"
          size="sm"
          :disabled="!jupyterUrl || !currentUser"
          v-b-tooltip
          :title="(!!currentUser) ? $t('source.jupyter.enabled') : $t('source.jupyter.disabled')"
        >
          <img :src="jupyterLogo" width="17" alt="jupyter_logo">
          <TextView class="button-label" type="Small-1">
            <span class="button-label">&nbsp;{{ $t("source.jupyter.open") }}</span>
          </TextView>
        </b-button>
      </template>

      <template>
        <b-button
          v-if="deployUrl"
          variant="outline-dark"
          size="sm"
          :href="deployUrl"
          target="_blank"
          v-b-tooltip
        >
          <b-icon-collection-play />
          <TextView class="button-label" type="Small-1">
            <span class="button-label">&nbsp;{{ $t("source.deployment.open") }}</span>
          </TextView>
        </b-button>
      </template>
    </b-button-group>
  </div>
</template>

<script>
import {mapActions, mapGetters, mapState} from 'vuex';

import Utils from '../utils';
import TextView from '@/_Hub/components/TextView.vue';
import {CONNEXION_MODE, get} from '@/_Hub/tools/https';
import {PROXY_URL, STORE_DVC_URL} from '@/_Hub/Endpoint';
import STAC from '../models/stac';
import STACLogo from '@/assets/img/STAC_logo.png';
import DVCLogo from '@/assets/img/logo-dvc.svg';
import MLFlowLogo from '@/assets/img/MLflow-Logo.svg';
import JupyterLogo from '@/assets/img/Jupyter_logo.svg';
import DVCCodeGenerator from '@/_Hub/components/CodeGenerator/DVCCodeGenerator.vue';
import STACCodeGenerator from '@/_Hub/components/CodeGenerator/STACCodeGenerator.vue';
import MLflowCodeGenerator from '@/_Hub/components/CodeGenerator/MLflowCodeGenerator.vue';


export default {
  name: 'Source',
  components: {
    MLflowCodeGenerator,
    STACCodeGenerator,
    DVCCodeGenerator,
    TextView
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
      jupyterUrl: undefined,
      deployUrl : undefined,
      stacLogo: STACLogo,
      dvcLogo: DVCLogo,
      mlflowLogo: MLFlowLogo,
      jupyterLogo: JupyterLogo

    };
  },
  computed: {
    ...mapState(['conformsTo', 'dataLanguages', 'locale', 'data', 'auth', 'provideConfig', 'privateQueryParameters', 'supportedLocales', 'stacLint', 'stacProxyUrl', 'uiLanguage', 'valid']),
    ...mapGetters(['supportsExtension', 'root']),

    currentUser() {
      return !!this.auth.user && this.auth.mode !== CONNEXION_MODE.DEFAULT_TOKEN;
    },

    canUseJupyter() {
      if (this.auth?.mode === CONNEXION_MODE.DEFAULT_TOKEN) {
        return false;
      }
      if (this.stac) {
        const {jupyterlab} = this.provideConfig;
        if (!jupyterlab.url) {
          return null;
        }
        return this.stac?.getMetadata('sharinghub:jupyter') === 'enable';
      }
      return false;
    },
    canUseDVC() {
      return this.dvcUrl() !== null;
    },
    canUseMlflow() {
      if (!this.mlflowUrl()) {
        return false;
      }
      if (this.stac) {
        return this.stac?.getMetadata('sharinghub:mlflow') === 'enable';
      }
      return false;
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler(data) {
        this.jupyterUrl = undefined;
        if (data) {

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
                const {http_url_to_repo, default_branch, namespace: {full_path}} = res.data;
                const repo_url = new URL(http_url_to_repo);
                let lab_path = '';
                if (notebooks.length > 0) {
                  const notebook_path = this.extractNotebookfile(full_path, notebooks[0]);
                  lab_path = notebook_path ? lab_path.concat(`&subpath=${notebook_path}`) : lab_path;
                }
                this.jupyterUrl = `${this.jupyter}/hub/user-redirect/git-pull?repo=${repo_url.protocol}//oauth2:${token}@${repo_url.host}${repo_url.pathname}&branch=${default_branch}&app=lab${lab_path}`;
              }
            });
          }

          const appDeployerUrl = this.canDeployAsService(data);
          this.deployUrl = this.getDeployUrl(appDeployerUrl);
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
      if (!this.data || !(this.data instanceof STAC)) {
        return null;
      }

      const projectID = this.data.getMetadata('sharinghub:id');
      if (!projectID || !store || this.data.getMetadata('sharinghub:store-s3') !== 'enable') {
        return null;
      }
      return STORE_DVC_URL + projectID;
    },
    mlflowUrl() {
      if (!this.data || !(this.data instanceof STAC)) {
        return null;
      }
      const {mlflow} = this.provideConfig;
      const projectPath = this.data.getMetadata('sharinghub:path');
      if (!projectPath || (!mlflow.url)) {
        return null;
      }
      return mlflow.url.endsWith('/') ? mlflow.url.concat(projectPath).concat('/tracking') :
        mlflow.url.concat(`/${projectPath}`).concat('/tracking');
    },
    openJupyterLink(ev, url) {
      window.open(url, '_blank');
    },
    extractNotebookfile(full_path, download_path) {
      const truth_path = download_path.replace(`${full_path}/`, '');
      const index = truth_path.indexOf('repository');
      if (index) {
        return truth_path.substring(index).split('/').splice(1).join('/');
      }
      return undefined;
    },
    canDeployAsService(data) {
      let service_deployer = undefined;
      const {spaces} = this.provideConfig;
      const assets = data.assets;
      for (const [title_asset] of Object.entries(assets)) {
        if (service_deployer) {
          break;
        }
        for (const [_deployer, config] of Object.entries(spaces)) {
          let file = title_asset.split('/').reverse()[0];
          const has_deployer_service = config['assets'].includes(file);
          if (has_deployer_service) {
            service_deployer = _deployer;
            break;
          }
        }
      }
      return service_deployer;
    },
    getDeployUrl(app_deployer){
      const {spaces} = this.provideConfig;
      if(app_deployer && spaces){
        const BASE_URL =  spaces[app_deployer] ? spaces[app_deployer]['url'] : undefined;
        const path = this.stac.getMetadata('sharinghub:path');
        if(BASE_URL && path){
          return  BASE_URL.concat(path);
        }
      }
      return undefined;
    }
  }
};
</script>

<style lang="scss">
@import 'src/theme/variables';
@import 'src/assets/mixins';

#popover-dvc, #popover-stac, #popover-dvc, #popover-mlflow {
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

</style>
<style lang="scss" scoped>
.lang-item > .dropdown-item {
  display: flex;

  > .title {
    flex: 1;
  }
}

.btn-group {
  .btn {
    height: 32px !important;
  }
}

.btn-group-code-generator {
  .btn {
    min-width: 65px;
    display: flex !important;
    justify-content: center;
    align-items: center;
  }
}

@media screen and (max-width: 575px) {
  .sm\: {
    &hidden {
      display: none !important;
    }

    &block {
      display: block !important;
    }
  }
}
</style>
