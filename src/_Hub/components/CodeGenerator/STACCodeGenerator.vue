<template>
  <div class="STACCodeGenerator px-3">
    <b-tabs small class="pt-2">
      <b-tab class="pt-4">
        <template #title>
          <text-view type="header__b14" class="tab-active">
            PySTAC - download assets
          </text-view>
        </template>
        <div class="d-flex flex-column">
          <div>
            <b-button
              variant="primary"
              class="mr-5 my-1 float-right"
              size="sm"
              href="https://pystac.readthedocs.io/en/stable/quickstart.html"
              target="_blank"
            >
              <b-icon-journal />
              {{ $t('source.stac.docs_pystac') }}
            </b-button>
          </div>

          <div v-for="(item, idx) in getCodeTemplate()" :key="idx">
            <div class="d-flex align-items-center w-9">
              <text-view type="header__b14" v-if="item.header">
                {{ item.header }}
              </text-view>
            </div>
            <code-generator
              :language="item.language"
              :code-with-credentials="item.textWithCredentials"
              :code="item.text"
            />
          </div>
        </div>
      </b-tab>

      <b-tab class="pt-4">
        <template #title>
          <text-view type="header__b14" class="tab-active">
            EODAG - download assets
          </text-view>
        </template>
        <div class="d-flex flex-column">
          <div>
            <b-button
              variant="primary"
              class="mr-5 my-1 float-right"
              size="sm"
              href="https://eodag.readthedocs.io/en/stable/"
              target="_blank"
            >
              <b-icon-journal />
              {{ $t('source.stac.docs_eodag') }}
            </b-button>
          </div>
          <div v-for="(item, idx) in getEodagCodeTemplate()" :key="idx">
            <div class="d-flex align-items-center w-9">
              <text-view type="header__b14" v-if="item.header">
                {{ item.header }}
              </text-view>
            </div>
            <code-generator
              :language="item.language"
              :code-with-credentials="item.textWithCredentials"
              :code="item.text"
            />
          </div>
        </div>
      </b-tab>

      <b-tab class="pt-4">
        <template #title>
          <text-view type="header__b14" class="tab-active">
            STAC API
          </text-view>
        </template>
        <div>
          <TabSectionApiStac v-if="data" :title="title" :stacUrl="url" :stac="data" />
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import {getEODAGCodeTemplate, getPySTACCodeTemplate} from '@/_Hub/components/CodeGenerator/codeTemplates';
import CodeGenerator from '@/_Hub/components/CodeGenerator/CodeGenerator.vue';
import {mapState} from 'vuex';
import TextView from '@/_Hub/components/TextView.vue';
import {CONNEXION_MODE} from '@/_Hub/tools/https';
import 'highlight.js/lib/languages/python';
import TabSectionApiStac from '@/_Hub/views/sections/TabSectionApiStac.vue';
import {STAC_SEARCH} from '@/_Hub/Endpoint';




export default defineComponent({
  name:'STACCodeGenerator',
  components:{
    TabSectionApiStac,
    TextView,
    CodeGenerator
  },
  props:{
  },
  data(){
    return{
    };
  },
  computed:{
    ...mapState(['url', 'config', 'auth', 'data', 'title', 'uiLanguage', 'entriesRoute']),
    defaultToken(){
      return '<your_access_token> or <your_personal_gitlab_token>';
    },
    token(){
      const {mode, token} = this.auth;
      let _token = this.defaultToken;
      if([CONNEXION_MODE.CONNECTED, CONNEXION_MODE.PRIVATE_TOKEN].includes(mode)){
        _token = token;
      }
      return _token;
    }
  },
  methods:{
    getCodeTemplate(){
      const uiLanguage = this.uiLanguage || 'en';
      return Object.entries(getPySTACCodeTemplate).map(([, val]) =>{
        let item = {
          language: val.language,
          header : val.header[uiLanguage]
        };
        if(val.arg){
          switch (val.arg){
            case 'credentials stac_url':
              item['text'] = val.text({arg:this.defaultToken, arg1:this.url});
              item['textWithCredentials'] = val.text({arg:this.token, arg1:this.url});
              return item;
            default:
              break;
          }
        }
        item['text'] = val.text();
        return item;
      });
    },

    getEodagCodeTemplate(){
      const uiLanguage = this.uiLanguage || 'en';
      const entry = this.$route.path.split('/')[4];
      const collection = this.entriesRoute.find(el => el.route ===  entry);
      if(!collection){
        throw Error(`Collection ${entry} not found`);
      }
      return Object.entries(getEODAGCodeTemplate).map(([, val]) =>{
        let item = {
          language: val.language,
          header : val.header[uiLanguage]
        };
        if(val.arg){
          switch (val.arg){
            case 'stac_search base_uri credentials':
              item['text'] = val.text({
                arg:STAC_SEARCH,
                arg1:window.origin,
                arg2:this.defaultToken,
                arg3: collection.route,
                arg4:  this.data.id
              });
              item['textWithCredentials'] = val.text({
                arg:STAC_SEARCH,
                arg1:window.origin,
                arg2:this.token,
                arg3: collection.route,
                arg4: this.data.id
              });
              return item;
            default:
              break;
          }
        }
        item['text'] = val.text();
        return item;
      });
    }
  }
});

</script>

<style  lang="scss">
@import 'src/assets/colors';
@import 'src/theme/variables';
@import 'src/assets/mixins';

.STACCodeGenerator{
  width: 100%;
  //max-height: 800px;
  overflow-y: auto;
  @include scrollbars(0.6em, map-get($theme-colors, 'primary'));
  .nav-item{
    .active{
      border-bottom: solid map-get($theme-colors, 'primary') 4px !important;
      border-radius: 0 !important;
      color: map-get($theme-colors, 'primary') !important;
    }
  }
  .nav-link{
    color: map-get($theme-colors, 'dark') ;
  }
}
</style>
