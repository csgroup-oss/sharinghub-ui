<template>
  <div class="d-inline-flex">
    <b-button-group size="sm">
      <template>
        <template>
          <b-button size="sm" variant="outline-primary" id="popover-share-btn" :title="$t('source.share.withOthers')">
            <b-icon-share scale="0.7" />
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
          :title="has_rated ? ' Unstar': ' Star'"
        >
          <b-icon :icon="has_rated ? 'star-fill' :'star'" scale="0.7" aria-hidden="true" />
          {{ has_rated ? ' Unstar': ' Star' }}
        </b-button>
        <b-button size="sm" disabled variant="outline-dark">
          {{ rank_rate }}
        </b-button>
      </template>
    </b-button-group>
  </div>
</template>

<script>

import {defineComponent} from 'vue';
import {mapActions, mapGetters, mapState} from 'vuex';
import Url from './Url.vue';
import Utils from '../utils';
import {CONNEXION_MODE, get, post} from '@/_Hub/tools/https';
import {PROXY_URL} from '@/_Hub/Endpoint';
import STAC from '@/models/stac';



export default defineComponent( {
  name: 'ShareButtonGroup',
  components: {
    Url
  },
  props: {},
  data() {
    return {
      can_rate: false,
      rank_rate: undefined,
      has_rated: false
    };
  },
  computed: {
    ...mapState(['conformsTo', 'dataLanguages', 'locale', 'data', 'auth', 'provideConfig', 'privateQueryParameters', 'supportedLocales', 'stacLint', 'stacProxyUrl', 'uiLanguage', 'valid']),
    ...mapGetters(['supportsExtension', 'root']),
    showRoot() {
      if (!this.root) {
        return false;
      }
      return (Array.isArray(this.conformsTo) && this.conformsTo.length > 0)
        || Utils.isObject(this.root['stats:collections'])
        || Utils.isObject(this.root['stats:catalogs'])
        || Utils.isObject(this.root['stats:items']);
    },
    message() {
      return this.$t('source.share.message', {title: this.title, url: this.browserUrl()});
    },
    currentUser() {
      return !!this.auth.user && this.auth.mode !== CONNEXION_MODE.DEFAULT_TOKEN;
    },
    twitterUrl() {
      let text = encodeURIComponent(this.message);
      return `https://twitter.com/intent/tweet?text=${text}`;
    },
    mailTo() {
      let title = encodeURIComponent(this.title);
      let text = encodeURIComponent(this.message);
      return `mailto:?subject=${title}&body=${text}`;
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

    }
  }
});
</script>

<style scoped lang="scss">
@import '../theme/variables';
@import '../assets/mixins';
 #popover-share {
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
.btn-group{
  .btn{
    height: 30px !important;
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
