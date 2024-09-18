<template>
  <b-row class="stac-header">
    <div class="col-md-12 stac-header">
      <div v-if="!loading" class="float-right">
        <Source :is-mobile="false" :jupyter="jupyterLabUrl" action="share" :title="title" :stacUrl="url" :stac="data" />
      </div>

      <div>
        <div class="sm:flex-column md:flex-row lg:flex lg:flex-row xl:flex xl:flex-row align-items-center">
          <template v-if="icon">
            <img :src="icon.href" :alt="icon.title" :title="icon.title" class="icon mr-2">
          </template>
          <b-button
            v-if="hasBack" size="sm" @click="$event => $router.back()" variant="outline-primary"
            pill class="mr-2"
          >
            <b-icon-arrow-left />
          </b-button>
          <text-view class="mr-4" type="header__b20">
            <span class="title">{{ title }}</span>
          </text-view>
          <share-button-group />
        </div>

        <text-view type="header__16" class="block pt-1 pb-3 mt-2" v-if="url">
          <i18n v-if="containerLink" tag="span" path="in" class="in mr-3">
            <template #catalog>
              <small>
                <StacLink :data="containerLink" />
              </small>
              <b-badge pill variant="secondary" class="ml-2">
                <template v-if="userAccessLevel === ACCESS_LEVELS.NO_ACCESS">
                  <b-icon scale="0.9" icon="globe" />
                  <span> {{ $t("source.share.access_level.public") }}</span>
                </template>
                <template v-if="userAccessLevel === ACCESS_LEVELS.READ_ONLY">
                  <b-icon scale="0.9" icon="eye-fill" />
                  <span> {{ $t("source.share.access_level.read_only") }}</span>
                </template>
                <template v-if="userAccessLevel === ACCESS_LEVELS.ADMINISTRATOR">
                  <b-icon scale="0.9" icon="people-fill" />
                  <span> {{ $t("source.share.access_level.owner") }}</span>
                </template>
                <template v-if="userAccessLevel === ACCESS_LEVELS.CONTRIBUTOR">
                  <b-icon scale="0.9" icon="pen-fill" />
                  <span> {{ $t("source.share.access_level.contributor") }}</span>
                </template>
                <template v-if="userAccessLevel === ACCESS_LEVELS.GUEST">
                  <b-icon scale="0.9" icon="shield-fill-x" />
                  <span> {{ $t("source.share.access_level.guest") }}</span>
                </template>
              </b-badge>
            </template>
          </i18n>
        </text-view>
      </div>

      <div>
        <div class="flex flex-wrap" v-if="!!data?.properties">
          <Keywords :keywords="keywords" />
        </div>
      </div>

      <div>
        <Source :is-mobile="true" :jupyter="jupyterLabUrl" action="share" :title="title" :stacUrl="url" :stac="data" />
      </div>
    </div>
  </b-row>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Source from './Source.vue';
import StacLink from './StacLink.vue';
import STAC from '../models/stac';
import Utils, {ACCESS_LEVELS} from '../utils';
import Keywords from '@/components/Keywords.vue';
import TextView from '@/_Hub/components/TextView.vue';
import ShareButtonGroup from '@/components/ShareButtonGroup.vue';

export default {
  name: 'StacHeader',
  components: {
    ShareButtonGroup,
    TextView,
    Keywords,
    StacLink,
    Source
  },
  data() {
    return {
      jupyterLabUrl: undefined,
      loading: true,
      userAccessLevel: undefined
    };
  },
  computed: {
    ACCESS_LEVELS() {
      return ACCESS_LEVELS;
    },
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
  watch:{
    data:{
      immediate:true,
      async handler(data){
         if(!(data instanceof STAC)){
           return;
         }
        this.userAccessLevel = data.getMetadata('sharinghub:access-level');
      }
    }
  },
  async beforeMount() {
    this.jupyterLabUrl = this.provideConfig.jupyterlab?.url;
    this.loading = false;
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
