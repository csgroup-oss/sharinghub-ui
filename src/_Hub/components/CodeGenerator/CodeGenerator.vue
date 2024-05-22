
<template>
  <div class="code-section d-flex justify-content-between align-items-start">
    <div class="code-highlight">
      <pre v-highlightjs="code">
        <code ref="codeBlock" :class="language" />
      </pre>
    </div>

    <div class="extra-section">
      <b-button
        size="sm"
        @click="copy"
        :variant="variant"
        class="copy-button"
      >
        {{ $t('copy') }}
      </b-button>
    </div>
  </div>
</template>


<script>
import {defineComponent} from 'vue';
import {Clipboard} from 'v-clipboard';
import Vue from 'vue';
import hljs from 'highlight.js';
import VueHighlightJS from 'vue-highlightjs';
import 'highlight.js/styles/default.css';
import 'highlight.js/styles/panda-syntax-dark.min.css';

Vue.use(VueHighlightJS);

hljs.configure({
  ignoreUnescapedHTML:true,
  throwUnescapedHTML:false
});

export default defineComponent( {
  name: 'CodeGenerator',
  components:{
  },
  props:{
    code:{
      type:String,
      required:false,
      default:undefined
    },
    codeWithCredentials:{
      type:String,
      required:false,
      default:undefined
    },
    language:{
      type:String,
      required:true
    }
  },
  data(){
    return{
      status: null
    };
  },
  computed: {
    variant(){
      return this.status ? 'success' : 'primary';
    }
  },
  watch:{
    code:{
      immediate : true,
      handler(){
        this.$nextTick(() => {
          this.highlightCode();
        });
      }
    },
    status:{
      immediate : true,
      handler(){
        this.$nextTick(() => {
          this.highlightCode();
        });
      }
    }
  },
  methods: {
    async copy(){
      try {
        let focus = document.activeElement;
        await Clipboard.copy( this.codeWithCredentials ? this.codeWithCredentials : this.code);
        focus.focus();
        this.status = true;
      } catch(error) {
        console.error(error);
        this.status = false;
      }
      setTimeout(() => this.status = null, 2500);
    },
    highlightCode() {
      const codeBlock = this.$refs.codeBlock;
      delete codeBlock.dataset.highlighted;
      hljs.highlightElement(codeBlock);
    }
  }
});
</script>


<style scoped lang="scss">
@import "src/assets/mixins";
@import 'src/theme/variables';
.code-section{
  .code-highlight{
    width: 95%;
    overflow-x: auto;
    white-space: nowrap;
    @include scrollbars(0.6em, map-get($theme-colors, 'primary'));
    @include h_scrollbars(0.6em, map-get($theme-colors, 'primary'));
    pre{
      margin: 0 !important;
    }
  }
  .extra-section{
    width: 5%;
  }
  .copy-button{
    width: 100%;
    min-width: 80px;
    height: 28px;
    margin-top: 20px;
    margin-left: -81px;
    text-align: center;
  }
}
</style>
