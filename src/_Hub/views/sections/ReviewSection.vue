<script>
import Vue, {defineComponent} from 'vue';
import Vssue, {VssueComponent} from "vssue";
import 'vssue/dist/vssue.css';
import GitlabV4 from "@vssue/api-gitlab-v4";


Vue.use(Vssue);


const vsOptions = {
  api: GitlabV4,
  labels:[],
  prefix:[""],
  owner: "olivier.koko",
  repo: "gitlab_to_stac_test",
  clientId: "50a9f8a95e3a0c56cfff47adb281ee23b5e332ae4809505409b54bc064d2d1a6",
  clientSecret: "2524fb8496c1c76f78c31fc51ebf68ed5f1042f429f9529c334c159001ad4fc5",
  baseURL: "https://gitlab.si.c-s.fr",
};

export default defineComponent({
  name: "ReviewSection",
  components: {
    'Vssue': VssueComponent,
  },
  data() {
    return {
      issueId: 1,
      title: "First issues test",
      options: vsOptions,
    };
  },
  mounted() {
    console.log(this.options);
  }
});
</script>


<template>
  <div class="w-100">
    <Vssue :issue-id="issueId" :title="title" :options="options"
    />
  </div>
</template>

<style scoped lang="scss">

</style>

