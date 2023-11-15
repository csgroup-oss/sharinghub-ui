<template>
  <b-row>
    <b-col md="12">
      <Source class="float-right" :title="title" :stacUrl="url" :stac="data" />
      <h1>
        <template v-if="icon">
          <img :src="icon.href" :alt="icon.title" :title="icon.title" class="icon mr-2">
        </template>
        <span class="title">{{ title }}</span>
      </h1>
      <p class="lead" v-if="url || isSearchPage()">
        <i18n v-if="containerLink" tag="span" path="in" class="in mr-3">
          <template #catalog>
            <StacLink :data="containerLink" />
          </template>
        </i18n>
        <b-button-group>

          <template>
            <b-button v-if="collectionLink" :to="toBrowserPath(collectionLink.href)" :title="collectionLinkTitle" variant="outline-primary" size="sm">
              <b-icon-folder-symlink />
              <span class="button-label prio">{{ $t('goToCollection.label') }}</span>
            </b-button>

            <b-button v-if="authConfig" variant="outline-primary" size="sm" @click="auth" :title="$t('authentication.button.title')">
              <template v-if="authData">
                <b-icon-lock />
                <span class="button-label">{{ $t('authentication.button.authenticated') }}</span>
              </template>
              <template v-else>
                <b-icon-unlock />
                <span class="button-label">{{ $t('authentication.button.authenticate') }}</span>
              </template>
            </b-button>

          </template>
        </b-button-group>
      </p>

      <b-col cols="12">
        <b-row v-if="rankRate" class="p-mb-3">
          <b-button-group size="sm">
            <b-button @click="canRate ? starProject() : UnStarProject()" variant="outline-dark">
              <b-icon :icon=" canRate ? 'star' : 'star-fill'" scale="0.8" aria-hidden="true"></b-icon>
              <TextView type="Small-1" v-html="canRate ? ' Star' : ' Unstar'"></TextView>
            </b-button>
            <b-button disabled variant="outline-dark"> {{ rankRate }}</b-button>
          </b-button-group>
        </b-row>

        <b-row v-if="!!data?.properties">
          <Keywords v-if="Array.isArray(data.properties.keywords) &&
            data?.properties?.keywords?.length > 0" :keywords="data.properties.keywords" />
        </b-row>
      </b-col>
    </b-col>
  </b-row>
</template>

<script>
import {mapGetters, mapState} from 'vuex';
import Source from './Source.vue';
import StacLink from './StacLink.vue';
import {BIconArrow90degUp, BIconBook, BIconFolderSymlink, BIconLock, BIconSearch, BIconUnlock} from "bootstrap-vue";
import STAC from '../models/stac';
import Utils from '../utils';
import Keywords from "@/components/Keywords.vue";
import {get, post} from "@/_Hub/tools/https";
import {PROXY_URL} from "@/_Hub/Endpoint";
import TextView from "@/_Hub/components/TextView.vue";


export default {
  name: 'StacHeader',
  components: {
    TextView,
    Keywords,
    BIconArrow90degUp,
    BIconBook,
    BIconFolderSymlink,
    BIconSearch,
    BIconLock,
    BIconUnlock,
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
    parentLinkTitle() {
      if (this.parentLink && Utils.hasText(this.parentLink.title)) {
        return this.$t('goToParent.descriptionWithTitle', this.parentLink);
      } else {
        return this.$t('goToParent.description');
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
    searchBrowserLink() {
      if (!this.canSearch) {
        return null;
      }
      let dataLink;
      if (this.data instanceof STAC && !this.data.equals(this.root)) {
        dataLink = this.data.getSearchLink();
      }
      if (dataLink) {
        return `/search${this.data.getBrowserPath()}`;
      } else if (this.root && this.allowSelectCatalog) {
        return `/search${this.root.getBrowserPath()}`;
      }
      return '/search';
    },
    containerLink() {
      // Check two cases where this page is the root...
      if (this.catalogUrl && this.url === this.catalogUrl) {
        return null;
      }
      if (this.root) {
        if (Utils.equalUrl(this.root.getAbsoluteUrl(), this.url)) {
          return null;
        } else {
          return {
            href: this.root.getAbsoluteUrl(),
            rel: 'root',
            title: STAC.getDisplayTitle(this.root)
          };
        }
      }
      return this.collectionLink || this.parentLink;
    },
  },
  watch: {
    url: {
      immediate: true,
      async handler(url) {
        if (url) {
          let projectID = this.getProjectID(url);
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
    },
  },
  mounted() {
  },
  methods: {
    isSearchPage() {
      return this.$router.currentRoute.name === 'search';
    },
    auth() {
      this.$store.commit('requestAuth', () => this.$store.dispatch("load", {
        url: this.url,
        loadApi: true,
        show: true,
        force: true
      }));
    },
    getProjectID(url = "") {
      const reversed = url.split("/").reverse();
      if (reversed.length === 0) {
        return undefined;
      }
      return !isNaN(parseInt(reversed[0])) ? parseInt(reversed[0]) : undefined;
    },
    starProject() {
      let url = this.url;
      if (!url) throw  new Error('url is wrong');
      const projectID = this.getProjectID(url);
      post(PROXY_URL.concat(`projects/${projectID}/star`))
        .then((response) => {
          if (response.data) {
            this.canRate = false;
            this.rankRate++;
          }
        });
    },
    UnStarProject() {
      let url = this.url;
      if (!url) throw  new Error('url is wrong');
      const projectID = this.getProjectID(url);
      post(PROXY_URL.concat(`projects/${projectID}/unstar`))
        .then((response) => {
          if (response.data) {
            this.canRate = true;
            this.rankRate--;
          }
        });
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
