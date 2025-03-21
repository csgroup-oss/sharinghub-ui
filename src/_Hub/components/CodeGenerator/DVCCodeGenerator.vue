<template>
  <div class="DVCCodeGenerator px-3">
    <b-tabs small class="">
      <b-tab v-if="!alreadySetup" class="pt-4">
        <template #title>
          <text-view type="header__b14" class="tab-active">
            DVC - Init
          </text-view>
        </template>
        <div class="d-flex flex-column">
          <div class="mb-3">
            <b-button
              variant="primary"
              class="mr-5 float-right"
              size="sm"
              href="https://dvc.org/doc"
              target="_blank"
            >
              <b-icon-journal />
              {{ $t('source.dvc.docs') }}
            </b-button>
            <b-button
              variant="primary"
              class="mr-4 float-right"
              size="sm"
              :href="dvcDocsUrl"
              target="_blank"
            >
              <b-icon-journal />
              {{ $t('source.dvc.tutorial') }}
            </b-button>
          </div>

          <div v-for="(item, idx) in getUpdateCodeTemplate()" :key="idx">
            <text-view type="header__b14" v-if="item.header">
              {{ item.header }}
            </text-view>
            <code-generator
              language="Bash"
              :code-with-credentials="item.textWithCredentials"
              :code="item.text"
            />
          </div>
        </div>
      </b-tab>

      <b-tab class="pt-4">
        <template #title>
          <text-view type="header__b14" class="">
            DVC -  Pull
          </text-view>
        </template>
        <div class="flex-column d-flex">
          <div class="mb-3">
            <b-button
              variant="primary"
              class="mr-5 float-right"
              size="sm"
              href="https://dvc.org/doc"
              target="_blank"
            >
              <b-icon-journal />
              {{ $t('source.dvc.docs') }}
            </b-button>
            <b-button
              variant="primary"
              class="mr-4 float-right"
              size="sm"
              :href="dvcDocsUrl"
              target="_blank"
            >
              <b-icon-journal />
              {{ $t('source.dvc.tutorial') }}
            </b-button>
          </div>


          <div v-for="(item, idx) in getPullCodeTemplate()" :key="idx">
            <text-view type="header__b14" v-if="item.header">
              {{ item.header }}
            </text-view>
            <code-generator
              language="Bash"
              :code-with-credentials="item.textWithCredentials"
              :code="item.text"
            />
          </div>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import {
  getUpdateDVCCodeTemplate,
  getPullDVCCodeTemplate
} from '@/_Hub/components/CodeGenerator/codeTemplates';
import CodeGenerator from '@/_Hub/components/CodeGenerator/CodeGenerator.vue';
import {mapState} from 'vuex';
import TextView from '@/_Hub/components/TextView.vue';
import {CONNEXION_MODE} from '@/_Hub/tools/https';
import STAC from '@/models/stac';
import {DOCS_URL} from '@/_Hub/Endpoint';




export default defineComponent({
  name:'DVCCodeGenerator',
  components:{
    TextView,
    CodeGenerator
  },
  props:{
    dvcMode :{
      type: String,
      required: true
    },
    dvcStore :{
      type: String,
      required: true
    },
    projectId :{
      type: Number,
      required: true
    }
  },
  data(){
    return{
    };
  },
  computed:{
    ...mapState(['url', 'provideConfig', 'auth', 'data', 'uiLanguage']),
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
    },
    dvcDocsUrl() {
      const docs_url = this.provideConfig.docs.url || DOCS_URL;
      return docs_url.endsWith('/') ?
        docs_url.concat('tutorials/manage_dataset_with_dvc/')
        : docs_url.concat('/tutorials/manage_dataset_with_dvc/');
    },
    gitProvider(){
      if (!this.data || !(this.data instanceof STAC)) {
        return null;
      }
      const providers = this.data.getMetadata('providers');
      return  providers.find(pr => pr.roles.includes('host'));
    },
    alreadySetup(){
      return this.data?.getMetadata('sharinghub:dvc-init') === 'enable';
    }
  },
  methods:{
    getUpdateCodeTemplate(){
      return Object.entries(getUpdateDVCCodeTemplate).map(([, val]) =>{
        const uiLanguage = this.uiLanguage || 'en';
        let item = {
          language: val.language,
          header : val.header[uiLanguage]
        };
        if(val.arg){
          switch (val.arg){
            case 'config':
              item['text'] = val.text({
                storeMode: this.dvcMode,
                storeUrl: this.dvcStore,
                projectID: this.projectId
              });
              return item;
            case 'credentials':
              item['text'] = val.text({
                storeMode: this.dvcMode,
                token: this.defaultToken
              });
              item['textWithCredentials'] = val.text({
                storeMode: this.dvcMode,
                token: this.token
              });
              return item;
            default:
              break;
          }
        }
        item['text'] = val.text();
        return item;
      });
    },
    getPullCodeTemplate(){
      return Object.entries(getPullDVCCodeTemplate).map(([, val]) =>{
        const uiLanguage = this.uiLanguage || 'en';
        let item = {
          language: val.language,
          header : val.header[uiLanguage]
        };
        if(val.arg){
          switch (val.arg){
            case 'credentials dvc_pull':
              item['text'] = val.text({
                storeMode: this.dvcMode,
                token: this.defaultToken
              });
              item['textWithCredentials'] = val.text({
                storeMode: this.dvcMode,
                token: this.token
              });
              return item;
            case 'git_url directory':
              item['text'] = val.text({
                gitUrl: this.gitProvider.url.concat('.git'),
                repo: this.gitProvider.url.split('/').reverse()[0]
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

<style lang="scss">
@import 'src/assets/colors';
@import 'src/theme/variables';
@import 'src/assets/mixins';

.DVCCodeGenerator{
  width: 100%;
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
