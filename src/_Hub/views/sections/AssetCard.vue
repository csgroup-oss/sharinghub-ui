<script>
import {defineComponent} from 'vue';
import StacBrowser from "@/StacBrowser.vue";
import {getModel} from "@/_Hub/services/https";

export default defineComponent({
  name: "AssetCard",
  components: {StacBrowser},
  async created() {
    const findModel = await getModel(parseInt(this.$route.params.id));
    if (!findModel){
      this.$router.push({path:"/models"});
    }
    await this.$store.dispatch('load', {url: findModel.url, loadApi: true, show: true});
  }
});
</script>

<template>
  <div>
    <StacBrowser/>
  </div>
</template>

<style scoped lang="scss">

</style>
