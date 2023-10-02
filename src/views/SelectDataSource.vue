<template>
  <main class="select-data-source container">

    <h4 class="p-mb-5">{{ $t('index.selectTitle') }}</h4>
    <b-form @submit="go">
      <b-form-group
        id="select" :label="$t('index.specifyCatalog')" label-for="url"
        :invalid-feedback="error" :state="valid"
      >
        <b-form-input id="url" type="url" :value="url" @input="setUrl" placeholder="https://..." />
      </b-form-group>

       <b-form-group
        id="select-token" :label="$t('index.specifyToken')" label-for="token"
        :invalid-feedback="tokenError" :state="this.token===undefined || this.token?.length<1"
      >
        <b-form-input id="token" type="password" :value="token" @input="setToken" placeholder="token..."  />
         <small> {{ $t('index.specifyTokenDetail') }}  </small>
      </b-form-group>

       <b-button type="submit" variant="primary">{{ $t('index.load') }}</b-button>

    </b-form>

  </main>
</template>

<script>
import { BForm, BFormGroup, BFormInput, BListGroup, BListGroupItem } from 'bootstrap-vue';
import {mapActions, mapGetters} from "vuex";
import Description from '../components/Description.vue';
import Utils from '../utils';
import axios from "axios";
import {BASE_URL} from "@/_Hub/services/https";

export default {
  name: "SelectDataSource",
  components: {
    BForm,
    BFormGroup,
    BFormInput,
    BListGroup,
    BListGroupItem,
    Description
  },
  data() {
    return {
      url: 'https://gitlab.si.c-s.fr',
      token: "Fs_L1T6iXnq6zxGGSu9W",
    };
  },
  computed: {
    ...mapGetters(['toBrowserPath']),
    ...mapActions(['setBasUrl']),
    valid() {
      return !this.error;
    },
    error() {
      if (!this.url) {
        return null;
      }
      try {
        let url = new URL(this.url);
        if (!url.protocol) {
          return this.$t('index.urlMissingProtocol');
        }
        else if (!url.host) {
          return this.$t('index.urlMissingHost');
        }
        return null;
      } catch (errot) {
        return this.$t('index.urlInvalid');
      }
    },
     tokenError() {
      if (this.token) {
        return null;
      }
      return this.$t("index.tokenError")
    }

  },
  async created() {
    // Reset loaded STAC catalog
    this.$store.commit('resetCatalog', true);
    // Load entries from STAC Index
  },
  methods: {
    setUrl(url) {
      this.url = url;
    },
    setToken(token) {
      this.token =token ;
    },
    open(url) {
      this.url = url;
      this.go();
    },
    go(e) {
      //Fs_L1T6iXnq6zxGGSu9W
      e.preventDefault();
      if(!this.token || !this.url)
        return;
      const url = BASE_URL.concat(`${this.url.replace("https://","")}/${this.token}/`)
      this.$store.commit("setBaseUrl", url)

      this.$router.push("models");
    }
  }
};
</script>

<style lang="scss">
@import '../theme/variables.scss';

#stac-browser .select-data-source {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;

  hr {
    width: 100%;
  }

  .stac-index {
    margin: 0;
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    > div {
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: auto;
      border: 1px solid rgba(0,0,0,.125);
      border-radius: $border-radius;

      .list-group {
        width: 100%;

        .list-group-item {
          border: 0;
          border-bottom: 1px solid rgba(0,0,0,.125);
        }

        .active .styled-description a {
          color: white;
        }
      }
    }
  }
}
</style>
