<template>
  <b-row>
    <b-col md="12">
      <b-row v-if="!loading" class="float-right">
        <Source :jupyter="jupyterLabUrl" action="share" :title="title" :stacUrl="url" :stac="data"/>
      </b-row>
      <text-view type="header__b20">
        <template v-if="icon">
          <img :src="icon.href" :alt="icon.title" :title="icon.title" class="icon mr-2">
        </template>
        <b-button v-if="hasBack" size="sm" @click="$event => $router.back()" variant="outline-primary" pill
                  class="p-mr-2">
          <b-icon-arrow-left/>
        </b-button>
        <span class="title">{{ title }}</span>
      </text-view>
      <text-view type="header__16" class="p-d-block p-pt-1 p-pb-3" v-if="url">
        <i18n v-if="containerLink" tag="span" path="in" class="in mr-3">
          <template #catalog>
            <small>
              <StacLink :data="containerLink"/>
            </small>
          </template>
        </i18n>
        <b-button-group>
          <template>
            <b-button v-if="collectionLink" :to="toBrowserPath(collectionLink.href)" :title="collectionLinkTitle"
                      variant="outline-primary" size="sm">
              <b-icon-folder-symlink/>
              <span class="button-label prio">{{ $t('goToCollection.label') }}</span>
            </b-button>

          </template>
        </b-button-group>
      </text-view>

      <b-col cols="12">
        <b-row v-if="!!data?.properties">
          <Keywords v-if="Array.isArray(data.properties.keywords) &&
            data?.properties?.keywords?.length > 0" :keywords="data.properties.keywords"/>
        </b-row>
      </b-col>
    </b-col>
  </b-row>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Source from './Source.vue';
import StacLink from './StacLink.vue';
import STAC from '../models/stac';
import Utils from '../utils';
import Keywords from "@/components/Keywords.vue";
import {get} from "@/_Hub/tools/https";
import {CONFIG_URL} from "@/_Hub/Endpoint";
import TextView from "@/_Hub/components/TextView.vue";


export default {
  name: 'StacHeader',
  components: {
    TextView,
    Keywords,
    StacLink,
    Source
  },
  data() {
    return {
      jupyterLabUrl: undefined,
      loading: true,
    };
  },
  computed: {
    ...mapState(['allowSelectCatalog', 'authConfig', 'authData', 'catalogUrl', 'data', 'url', 'title',]),
    ...mapGetters(['canSearch', 'root', 'parentLink', 'collectionLink', 'toBrowserPath']),
    collectionLinkTitle() {
      if (this.collectionLink && Utils.hasText(this.collectionLink.title)) {
        return this.$t('goToCollection.descriptionWithTitle', this.collectionLink);
      } else {
        return this.$t('goToCollection.description');
      }
    },
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
          const provider = this.data?.getMetadata("providers").find(el => el.roles.includes("host"));
          const href = provider ? provider.url : this.root.getAbsoluteUrl();
          const title = `${STAC.getDisplayTitle(this.root)} / ${this.getProjectPath(this.data?._url)}`;
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
  },
  async beforeMount() {
    get(CONFIG_URL).then((response) => {
      if (response.data) {
        this.jupyterLabUrl = response.data.jupyterlab?.url;
        this.loading = false;
      }
    });
  },
  methods: {
    getProjectPath() {
      return this.data?.getMetadata('sharinghub:project-path');
    }
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

</style>
