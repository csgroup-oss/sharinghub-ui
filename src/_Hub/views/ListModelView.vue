<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import ResourceCard from "@/_Hub/components/ResourceCard.vue";
import {getListModels} from "@/_Hub/services/https";


export default defineComponent({
  name: "ListModelView",
  components: {ResourceCard, TextView},
  data() {
    return {
      loading: true,
      modelList: []
    };
  },
  created() {
    getListModels().then((data) => {

      this.modelList = data;
    });

  },
  methods: {
    async getModels() {
      return await getListModels();
    }
  },
  mounted() {
    console.log("model", this.modelList);
  }
});


</script>


<template>
  <div class="w-100 container">
    <TextView type="Title-1">Model List</TextView>

    <div class="section">
      <ResourceCard
        v-for="model in modelList" :metadata="model"/>
    </div>

  </div>
</template>

<style scoped lang="scss">
.section {
  width: 100%;
  display: grid;
  grid-template-columns: 48% 48%;
  grid-column-gap: 4%;

}
</style>
