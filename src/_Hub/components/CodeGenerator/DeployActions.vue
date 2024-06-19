<template>
  <div>
    <b-button-group>
      <b-dropdown right split variant="outline-dark">
        <template #button-content>
          <b-icon-terminal-fill />
          {{ $t('fields.model_deploy') }}
        </template>
        <b-dropdown-item
          v-if="streamlitUrl"
          target="_blank" :href="streamlitUrl"
        >
          <b-icon-lightning-charge-fill variant="warning" />
          Test as StreamLit App
        </b-dropdown-item>
      </b-dropdown>
    </b-button-group>
  </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'DeployActions',
  components: {},
  props: {
    streamlitUrl: {
      type: String,
      default : undefined
    }
  },
  data() {
    return {};
  }
});
</script>


<style  lang="scss">
.btn-group{
  .btn{
    //height: 36px !important;
  }
}
</style>
