<template>
  <div class="w-100">
    <Vssue :title="title" :options="options"
    />
  </div>
</template>

<script>
import Vue, {defineComponent} from 'vue';
import Vssue, {VssueComponent} from "vssue";
import 'vssue/dist/vssue.css';
import GitlabV4 from "@vssue/api-gitlab-v4";


Vue.use(Vssue);


const vsOptions = {
  api: GitlabV4,
  owner: "space_applications/mlops-services/gitlab2stac_tests",
  repo: "dataset-sample",
  clientId: "1e810488c2a8919fc56533220691215da5dff1c82d3242e8180e967891ef9b59",
  clientSecret: "65c4488e201bc86edd6ec9b03be579c61178d40e9dd3d1effada6a4b0ee79743",
  baseURL: "https://gitlab.si.c-s.fr",
};

export default defineComponent({
  name: "ReviewSection",
  components: {
    'Vssue': VssueComponent,
  },
  data() {
    return {
      title:"demo",
      options: vsOptions,
    };
  },
  mounted() {
    console.log(this.options);
  }
});
</script>


<style scoped lang="scss">

</style>
