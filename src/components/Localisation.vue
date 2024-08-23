<template>
  <div class="share">
    <b-dropdown
      size="sm" variant="link" right :dropright="right"
      toggle-class="text-decoration-none"
      :title="$t('source.language.switch')"
    >
      <template #button-content>
        <b-icon-globe scale="0.9" /> {{ uiLanguage }}
      </template>
      <b-dropdown-item
        v-for="l of languages" :key="l.code" class="lang-item"
        @click="switchLocale({locale: l.code, userSelected: true})"
      >
        <b-icon-check v-if="locale === l.code" />
        <b-icon-blank v-else />
        <span class="title">
          {{ l.native }}
          <template v-if="l.global && l.global !== l.native"> / {{ l.global }}</template>
        </span>
        <b-icon-exclamation-triangle
          v-if="supportsLanguageExt && (!l.ui || !l.data)"
          :title="l.ui ? $t('source.language.onlyUI') : $t('source.language.onlyData')"
          class="ml-2"
        />
      </b-dropdown-item>
    </b-dropdown>
  </div>
</template>

<script>
import {BDropdown, BDropdownItem} from 'bootstrap-vue';
import {mapActions, mapGetters, mapState} from 'vuex';
import Utils from '../utils';
import {getBest, prepareSupported} from '../locale-id';


const LANGUAGE_EXT = 'https://stac-extensions.github.io/language/v1.*/schema.json';

export default {
  name: 'Localisation',
  components: {
    BDropdown,
    BDropdownItem
  },
  props:{
    right:{
      type: Boolean,
      required: false
    }
  },
  computed: {
    ...mapState(['dataLanguages', 'locale', 'data', 'supportedLocales', 'uiLanguage']),
    ...mapGetters(['supportsExtension']),
    currentLanguage() {
      let lang = this.languages.find(l => l.code === this.locale);
      if (lang) {
        return lang.native;
      } else {
        return '-';
      }
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
      return languages.sort((a, b) => a.global.localeCompare(b.global, this.uiLanguage));
    }
  },
  watch: {
  },
  methods: {
    ...mapActions(['switchLocale'])
  }
};
</script>

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
