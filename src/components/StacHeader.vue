<template>
  <b-row>
    <div class="col-md-12">
      <div v-if="!loading" class="float-right">
        <Source :jupyter="jupyterLabUrl" action="share" :title="title" :stacUrl="url" :stac="data" />
        <div v-if="!!deployments" class="mt-4 justify-content-end lg:flex xl:flex md:hidden sm:hidden">
          <deploy-actions v-bind="deployments" />
        </div>
      </div>

      <div>
        <template v-if="icon">
          <img :src="icon.href" :alt="icon.title" :title="icon.title" class="icon mr-2">
        </template>
        <b-button
          v-if="hasBack" size="sm" @click="$event => $router.back()" variant="outline-primary"
          pill
          class="mr-2"
        >
          <b-icon-arrow-left />
        </b-button>
        <text-view class="mr-4" type="header__b20">
          <span class="title">{{ title }}</span>
        </text-view>
        <share-button-group />

        <text-view type="header__16" class="block pt-1 pb-3" v-if="url">
          <i18n v-if="containerLink" tag="span" path="in" class="in mr-3">
            <template #catalog>
              <small>
                <StacLink :data="containerLink" />
              </small>
            </template>
          </i18n>
        </text-view>
      </div>

      <div>
        <div class="flex flex-wrap" v-if="!!data?.properties">
          <Keywords :keywords="keywords" />
        </div>

        <div v-if="!!deployments" class="mt-4 justify-content-end lg:hidden xl:hidden md:flex sm:flex">
          <deploy-actions v-bind="deployments" />
        </div>
      </div>
    </div>
  </b-row>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Source from './Source.vue';
import StacLink from './StacLink.vue';
import STAC from '../models/stac';
import Utils from '../utils';
import Keywords from '@/components/Keywords.vue';
import TextView from '@/_Hub/components/TextView.vue';
import DeployActions from '@/_Hub/components/CodeGenerator/DeployActions.vue';
import ShareButtonGroup from '@/components/ShareButtonGroup.vue';


export default {
  name: 'StacHeader',
  components: {
    ShareButtonGroup,
    DeployActions,
    TextView,
    Keywords,
    StacLink,
    Source
  },
  data() {
    return {
      jupyterLabUrl: undefined,
      loading: true,
      deployments: null
    };
  },
  computed: {
    ...mapState(['allowSelectCatalog', 'authConfig', 'authData', 'catalogUrl', 'data', 'url', 'title', 'provideConfig']),
    ...mapGetters(['canSearch', 'root', 'parentLink', 'collectionLink', 'toBrowserPath']),

    icon() {
      if (this.data instanceof STAC) {
        let icons = this.data.getIcons();
        if (icons.length > 0) {
          return icons[0];
        }
      }
      return null;
    },
    containerLink() {
      // Check two cases where this page is the root..
      if (this.catalogUrl && this.url === this.catalogUrl) {
        return null;
      }
      if (this.root) {
        if (Utils.equalUrl(this.root.getAbsoluteUrl(), this.url)) {
          return null;
        } else {
          const provider = this.data?.getMetadata('providers').find(el => el.roles.includes('host'));
          const href = provider ? provider.url : this.root.getAbsoluteUrl();
          const title = `${this.data?.getMetadata('sharinghub:name')}`;
          return {
            href: href,
            rel: 'root',
            external: true,
            title: title
          };
        }
      }
      return this.collectionLink || this.parentLink;
    },
    hasBack() {
      return !!window.history.state;
    },
    keywords() {
      return this.data?.getMetadata('keywords').length > 0 ? this.data?.getMetadata('keywords') : [];
    }
  },
  watch: {
    data: {
      immediate: true,
      handler(data) {
        if (data instanceof STAC) {
          if (data.getMetadata('sharinghub:spaces') !== 'enable'
            || !this.canDeployAsStreamLit(data)) {
            this.deployments = null;
          } else {
            this.deployments = {
              streamlitUrl: this.getStreamLitUrl(data)
            };
          }

        }

      }
    }
  },
  async beforeMount() {
    this.jupyterLabUrl = this.provideConfig.jupyterlab?.url;
    this.loading = false;
  },
  methods: {
  }
};
</script>

<style lang="scss" scoped>

@import "src/assets/colors";
@import "src/assets/mixins";

h1 {
  word-break: break-word;
}

.hide {
  display: none !important;
}

@media screen and (max-width: 575px) {
  .sm\: {
    &hidden {
      display: none !important;
    }

    &block {
      display: block !important;
    }

    &flex {
      display: flex !important;
    }
  }

  .md\: {
    &hidden {
      display: none !important;
    }

    &block {
      display: block !important;
    }

    &flex {
      display: flex !important;
    }
  }
}
</style>
