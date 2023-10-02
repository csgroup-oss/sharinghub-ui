<script>
import Vue, {defineComponent} from 'vue';
//import Vssue, {VssueComponent} from "vssue";
//import 'vssue/dist/vssue.css';
//import GitlabV4 from "@vssue/api-gitlab-v4";
import Vssue, {VssueComponent} from "../../../../vendors/dist/vssue";
import '../../../../vendors/dist/vssue.css';
import GitlabV4 from "../../../../vendors/lib/index";


Vue.use(Vssue);


const vsOptions = {
  api: GitlabV4,
  state: 'Vssue',
  labels: ['Vssue'],
  prefix: '[Vssue]',
  admins: [],
  owner: "",
  repo: 406,
  clientId: "",
  clientSecret: "",
  privateToken:"Fs_L1T6iXnq6zxGGSu9W",
  baseURL: "https://gitlab.si.c-s.fr",
  proxy: url => `https://cors-anywhere.azm.workers.dev/${url}`,
  issueContent: ({ url }) => url,
  autoCreateIssue: true,
};

export default defineComponent({
  name: "ReviewSection",
  components: {
    'Vssue': VssueComponent,
  },
  data() {
    return {
      title: "Vssue Dev",
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
    <Vssue :title="title" :options="options"
    />
  </div>
</template>

<style scoped lang="scss">

</style>

