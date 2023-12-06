<template>
  <b-row>
    <b-col md="12">
      <b-row class="float-right">
         <Source action="share" :title="title" :stacUrl="url" :stac="data"/>
      </b-row>
      <h1>
        <template v-if="icon">
          <img :src="icon.href" :alt="icon.title" :title="icon.title" class="icon mr-2">
        </template>
        <b-button v-if="hasBack" size="sm" @click="$event => $router.back()" variant="outline-primary" pill class="p-mr-2" >
          <b-icon-arrow-left/>
        </b-button>
        <span class="title">{{ title }}</span>
      </h1>
      <p class="lead" v-if="url">
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
      </p>

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
import {PROXY_URL} from "@/_Hub/Endpoint";


export default {
  name: 'StacHeader',
  components: {
    Keywords,
    StacLink,
    Source
  },
  data() {
    return {
      canRate: false,
      rankRate: undefined,
      hasRank: false
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
          const href = provider ? provider.url :  this.root.getAbsoluteUrl();
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
    hasBack(){
      return !!window.history.state;
    }
  },
  watch: {
    data: {
      immediate: true,
      async handler(data) {
        if (data) {
          let projectID = Utils.getProjectID(data.id);
          get(PROXY_URL.concat(`projects/${projectID}/starrers`))
            .then((response) => {
              if (response.data) {
                this.rankRate = response.data.length;
                const currentUser = this.$store.state.auth.user;
                this.canRate = !response.data.some(el => el.user.username === currentUser.username
                  || el.user.web_url === currentUser.web_url);
              }
            });
        }
      }
    }
  },
  methods: {
    getProjectPath() {
      return this.data?.getMetadata('long_title');
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

.p-chip {
  font-size: 0.7em !important;
  border-radius: 0.5rem !important;
  background: transparent;
  max-width: 300px;
  text-overflow: ellipsis;
  text-wrap: normal;
  overflow: hidden;
  cursor: pointer;
  margin: 0 3px;

  &__outline {
    border: 1px rgba($primary-color, 0.5) solid;

    :hover {
      color: $primary-color;
      transition: color ease-in-out 0.2ms;
    }
  }

  &__info {
    @include fade_background($info)
  }

  &__primary {
    @include fade_background($primary-color)
  }

  &__danger {
    @include fade_background($danger)
  }

  &__red {
    @include fade_background($red)
  }

  &__darkgrey {
    @include fade_background($dark-grey)
  }

  &__purple {
    @include fade_background($purple)
  }
}
</style>
