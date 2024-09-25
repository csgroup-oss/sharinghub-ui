<template>
  <div class="item" :key="data.id">
    <b-row class="w-100">
      <b-col cols="7" class="right">
        <section class="intro">
          <DeprecationNotice v-if="data.properties.deprecated" :data="data" />
          <AnonymizedNotice v-if="data.properties['anon:warning']" :warning="data.properties['anon:warning']" />
          <Description v-if="description" :description="description" />
        </section>
      </b-col>

      <b-col cols="5" class="left">
        <inside-tabs>
          <inside-tab :title="$t('fields.metadata.general')">
            <section v-if="canViewMap" class="mb-4">
              <b-card no-body class="maps-preview">
                <b-tabs v-model="tab" ref="tabs" card pills vertical end>
                  <b-tab :title="$t('map')" no-body>
                    <Map :stac="data" :stacLayerData="selectedAsset" @dataChanged="dataChanged" scrollWheelZoom />
                  </b-tab>
                  <b-tab v-if="thumbnails.length > 0" :title="$t('thumbnails')" no-body>
                    <Thumbnails :thumbnails="thumbnails" />
                  </b-tab>
                </b-tabs>
              </b-card>
            </section>
            <Assets v-if="hasAssets" :assets="assets" :context="data" :shown="shownAssets" @showAsset="showAsset" />

            <Contributors />
          </inside-tab>

          <inside-tab :title="$t('fields.metadata.links')">
            <CollectionLink v-if="collectionLink & false" :link="collectionLink" />
            <Links v-if="additionalLinks.length > 0" :links="additionalLinks" />
          </inside-tab>

          <inside-tab :title="$t('fields.metadata.title')">
            <Providers v-if="data.properties.providers" :providers="data.properties.providers" />
            <Metadata :data="data" type="Item" :ignoreFields="ignoredMetadataFields" />
          </inside-tab>
        </inside-tabs>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Description from '../components/Description.vue';
import ShowAssetMixin from '../components/ShowAssetMixin';
import {BTab, BTabs} from 'bootstrap-vue';
import {addSchemaToDocument, createItemSchema} from '../schema-org';
import STAC from '@/models/stac';
import {get} from '@/_Hub/tools/https';
import {PROXY_URL} from '@/_Hub/Endpoint';
import {ACCESS_LEVELS, CATEGORIES} from '@/utils';
import InsideTabs from '@/_Hub/components/InsideTabs.vue';
import InsideTab from '@/_Hub/components/InsideTab.vue';
import Contributors from '@/_Hub/components/Contributors.vue';

export default {
  name: 'Item',
  components: {
    Contributors,
    InsideTab,
    InsideTabs,
    AnonymizedNotice: () => import('../components/AnonymizedNotice.vue'),
    Assets: () => import('../components/Assets.vue'),
    BTabs,
    BTab,
    CollectionLink: () => import('../components/CollectionLink.vue'),
    Description,
    DeprecationNotice: () => import('../components/DeprecationNotice.vue'),
    Links: () => import('../components/Links.vue'),
    Map: () => import('../components/Map.vue'),
    Metadata: () => import('../components/Metadata.vue'),
    Providers: () => import('../components/Providers.vue'),
    Thumbnails: () => import('../components/Thumbnails.vue')
  },
  mixins: [ShowAssetMixin],
  data() {
    return {
      ignoredMetadataFields: [
        'title',
        'description',
        'providers',
        // Will be rendered with a custom rendered
        'deprecated',
        // Don't show these complex lists of coordinates: https://github.com/radiantearth/stac-browser/issues/141
        'proj:bbox',
        'proj:geometry',
        // Special handling for the warning of the anonymized-location extension
        'anon:warning'
      ],
      description: undefined
    };
  },
  computed: {
    ...mapState(['data', 'url', 'uiLanguage']),
    ...mapGetters(['additionalLinks', 'collectionLink', 'parentLink']),
    canViewMap() {
      if (this.data instanceof STAC) {
        return this.data.getMetadata('sharinghub:map-viewer') === 'enable' && !!this.data.bbox;
      }
      return false;
    },
    relatedDataset() {
      let links = [];
      if (this.data instanceof STAC) {
        links = this.data.getLinksWithRels(['derived_from']);
        const dataset_links = links?.filter(link => link['category'] === CATEGORIES.DATASET);
        return dataset_links;
      }
      return links;
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler(data) {
        try {
          let schema = createItemSchema(data, [this.collectionLink, this.parentLink], this.$store);
          addSchemaToDocument(document, schema);
        } catch (error) {
          console.error(error);
        }
        await this.updateDescription();
      }
    },
    uiLanguage: {
      immediate: true,
      async handler() {
        await this.updateDescription();
      }
    }
  },
  methods: {
    async getProjectOwner(projectPath) {
      return get(PROXY_URL.concat('projects/').concat(projectPath))
        .then((response) => {
          if (response.data) {
            const {owner: {name, web_url}} = response.data;
            if (name) {
              const link = `<a href="${web_url}">${name}</a>`;
              return this.$t('source.share.access_level.guest_helper', [link]);
            }
          }
        });

    },
    async updateDescription() {
      if (!(this.data instanceof STAC)) {
        return;
      }
      const description = this.data.getMetadata('description');
      this.description = description;
      const projectID = this.data.getMetadata('sharinghub:id');
      const userAccessLevel = this.data.getMetadata('sharinghub:access-level');
      if (userAccessLevel === ACCESS_LEVELS.GUEST) {
        const helper_message = await this.getProjectOwner(projectID);
        if (helper_message) {
          if (description) {
            this.description = `${description}<br/><br/><hr/>${helper_message}<br/><br/>`;
          } else {
            this.description = helper_message;
          }
        }
      }
    }
  }
};
</script>

<style lang="scss">
@import '~bootstrap/scss/mixins';
@import "../theme/variables.scss";

#stac-browser .item {
  .left, .right {
    //max-width: 50%;
    @include media-breakpoint-down(sm) {
      max-width: 100%;
      min-width: 100%;
    }
  }

  .card-columns .thumbnail {
    align-self: center;
  }

  .metadata .card-columns {
    column-count: 1;

    &:not(.count-1) {
      @include media-breakpoint-up(xxxl) {
        column-count: 2;
      }
    }
  }
}
</style>
