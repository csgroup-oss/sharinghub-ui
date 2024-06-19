<template>
  <div class="MLflowCodeGenerator px-3">
    <b-tabs
      small class=""
    >
      <b-tab class="pt-4">
        <template #title>
          <text-view type="header__b14" class="tab-active">
            MLFlow Tracking
          </text-view>
        </template>
        <div class="d-flex flex-column">
          <div class="mb-3">
            <b-button
              :href="mlflowUrl" target="_blank"
              class="float-right mr-5"
              variant="outline-primary" size="sm"
            >
              <img width="15" :src="MLflow_icon">
              {{ $t('source.mlflow.show_ui') }}
            </b-button>

            <b-button
              variant="primary"
              class="mr-1 float-right"
              size="sm"
              href="https://mlflow.org/docs/latest/getting-started/index.html"
              target="_blank"
            >
              <b-icon-journal />
              {{ $t('source.mlflow.docs') }}
            </b-button>
          </div>

          <div v-for="(item, idx) in getMLFlowCodeTemplate()" :key="idx">
            <div class="d-flex align-items-center w-9">
              <text-view type="header__b14" v-if="item.header">
                {{ item.header }}
              </text-view>
              <div v-if="item.hasInput">
                <b-form-input
                  size="sm"
                  class="mx-3"
                  placeholder="type..."
                  v-model="experimentName"
                />
              </div>
            </div>
            <code-generator
              :language="item.language"
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
  getMlflowCodeTemplate
} from '@/_Hub/components/CodeGenerator/codeTemplates';
import CodeGenerator from '@/_Hub/components/CodeGenerator/CodeGenerator.vue';
import {mapState} from 'vuex';
import TextView from '@/_Hub/components/TextView.vue';
import {CONNEXION_MODE} from '@/_Hub/tools/https';
import STAC from '@/models/stac';
import MlFlow_icon from '@/assets/img/MLflow_icon.svg';



export default defineComponent({
  name:'MLflowCodeGenerator',
  components:{
    TextView,
    CodeGenerator
  },
  props:{
    mlflowUrl :{
      type :String,
      required:true
    }
  },
  data(){
    return{
      MLflow_icon:MlFlow_icon,
      experimentName:'example'
    };
  },
  computed:{
    ...mapState(['url', 'config', 'auth', 'data', 'uiLanguage']),
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
    projectID(){
      if (!this.data || !(this.data instanceof STAC)) {return null;}
      return  this.data.getMetadata('sharinghub:id');
    }
  },
  methods:{

    getMLFlowCodeTemplate(){
      const uiLanguage = this.uiLanguage;
      return Object.entries(getMlflowCodeTemplate).map(([, val]) =>{
        let item = {
          language: val.language,
          header : val.header[uiLanguage]
        };
        if(val.arg){
          switch (val.arg){
            case 'mlflow_tracking_url':
              item['text'] = val.text({arg:this.mlflowUrl});
              return  item;
            case 'credentials':
              item['text'] = val.text({arg:this.defaultToken});
              item['textWithCredentials'] = val.text({arg:this.token});
              return item;
              case 'mlflow_url mlflow_tracking_id':
              item['text'] =
                val.text({
                  arg: this.mlflowUrl,
                  arg1:`${(this.experimentName || 'experiment')} (${this.projectID})`
              });
              item['hasInput'] = true;
              return  item;
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

.MLflowCodeGenerator{
  width: 100%;
  overflow-y: auto;
  .nav-item{
    .active{
      border-bottom: solid map-get($theme-colors, 'primary') 4px !important;
      border-radius: 0 !important;
      color: map-get($theme-colors, 'primary') !important;
    }
  }
  input{
    height: 22px;
  }
  .nav-link{
    color: map-get($theme-colors, 'dark') ;
  }

}

</style>
