<script>
import {defineComponent} from 'vue'
import {
  BDropdown, BDropdownItem,
  BIconBlank,
  BIconBox,
  BIconCheck,
  BIconEnvelope,
  BIconExclamationTriangle,
  BIconFlag, BIconLink,
  BIconShare,
  BIconTwitter, BPopover
} from "bootstrap-vue";
import CopyButton from "@/components/CopyButton.vue";
import Url from "@/components/Url.vue";
import {mapActions, mapGetters, mapState} from "vuex";
import Utils from "@/utils";
import URI from "urijs";
import {getBest, prepareSupported} from "@/locale-id";
import RootStats from "@/components/RootStats.vue";

const LANGUAGE_EXT = 'https://stac-extensions.github.io/language/v1.*/schema.json';

export default defineComponent({
  name: "TabSectionApiStac",
  components: {
    RootStats,
    BPopover,
    Url,
    BIconLink,
    BDropdownItem,
    BDropdown,
    BIconExclamationTriangle,
    BIconCheck,
    BIconShare,
    BIconEnvelope,
    BIconBox,
    CopyButton,
    BIconTwitter,
    BIconFlag,
    BIconBlank
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
    }
  },
  computed: {
    ...mapState(['conformsTo', 'dataLanguages', 'locale', 'privateQueryParameters', 'supportedLocales', 'stacLint', 'stacProxyUrl', 'uiLanguage', 'valid']),
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
      }
      else {
        return '-';
      }
    },
    canValidate() {
      if (!this.stacLint || typeof this.stacUrl !== 'string') {
        return false;
      }
      else if (Utils.size(this.privateQueryParameters) > 0) {
        // Don't expose private query parameters to externals
        return false;
      }
      else if (Array.isArray(this.stacProxyUrl)) {
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
      for(let code of this.supportedLocales) {
        languages.push({
          code,
          native: this.$t(`languages.${code}.native`),
          global: this.$t(`languages.${code}.global`),
          ui: true
        });
      }

      // Add missing data languages
      for(let lang of this.dataLanguages) {
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
        for(let l of languages) {
          if (!l.ui) {
            l.ui = Boolean(getBest(uiSupported, l.code, null));
          }
          if (!l.data) {
            l.data = Boolean(getBest(dataSupported, l.code, null));
          }
        }
      }

      return languages.sort((a,b) => a.global.localeCompare(b.global, this.uiLanguage));
    }
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
    }
  },
  async beforeMount() {
     if (!this.canValidate) {
        return;
      }
      await this.$store.dispatch('validate', this.stacUrl);
  }
})
</script>

<template>
  <div class="share mt-1">
    <div v-if="stacUrl"  class="p-mt-3">
       <template v-if="stac">
        <b-row v-if="stacId" class="stac-id">
          <b-col cols="4">{{ $t('source.id') }}</b-col>
          <b-col>
            <code>{{ stacId }}</code>
            <CopyButton :copyText="stacId" :button-props="{size: 'sm'}" variant="primary" class="ml-2" />
          </b-col>
        </b-row>
        <b-row v-if="stacVersion" class="stac-version">
          <b-col cols="4">{{ $t('source.stacVersion') }}</b-col>
          <b-col>{{ stacVersion }}</b-col>
        </b-row>
        <b-row v-if="canValidate" class="validation">
          <b-col cols="4">{{ $t('source.valid') }}</b-col>
          <b-col>
            <b-spinner v-if="valid === null" :label="$t('source.validating')" small />
            <template v-else-if="valid === true">✔️</template>
            <template v-else-if="valid === false">❌</template>
            <template v-else>{{ $t('source.validationNA') }}</template>
          </b-col>
        </b-row>
        <hr>
      </template>
      <Url id="stacUrl" :url="stacUrl" :label="$t('source.locatedAt')" />
    </div>

  </div>


</template>

<style lang="scss">
#popover-link, #popover-root, #popover-share {
  width: 80%;
  max-width: 800px;

  .popover-body {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 80vh;
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
</style>
