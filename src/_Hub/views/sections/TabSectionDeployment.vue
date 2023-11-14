<script>
import {defineComponent} from 'vue';
import ProjectDownLoadStats from "@/_Hub/components/Stats/ProjectDownLoadStats.vue";

export default defineComponent({
  name: "TabSectionDeployment",
  components: {ProjectDownLoadStats},

});
</script>

<template>

  <b-row>
    <b-col cols="4">
      <ProjectDownLoadStats/>
    </b-col>
    <b-col class="p-mt-5" cols="12">
      <b-dropdown>
        <template #button-content>
          <b-icon scale="0.8" icon="file-code-fill"/>
          deploy
        </template>
        <b-dropdown-item>
          <span class="p-d-block p-text-bold">Inference Endpoint</span>
          <small>Production-ready API deployments</small>
        </b-dropdown-item>
      </b-dropdown>
    </b-col>


  </b-row>


</template>

<style scoped lang="scss">
#my-chart-id {
  width: 400px;
  height: 400px;
}
</style>
