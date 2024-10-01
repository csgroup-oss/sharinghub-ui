<template>
  <div class="w-full flex-column inside-tabs">
    <div v-if="tabs.length !==0" class="w-full flex">
      <div
        v-for="(tab, idx) in tabs" :class="['mr-4 px-3 pt-2 header-btn', index=== idx && 'active']"
        @click="selectTab(idx)"
        :key="tab.title"
      >
        <h2>{{ tab.title }}</h2>
      </div>
    </div>
    <div class="pt-4">
      <slot />
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue';


export default defineComponent({
  name: 'InsideTabs',
  components: {},
  data(){
    return {
      index: 0,
      tabs : []
    };
  },
  mounted() {
    this.tabs = this.$children;
    this.selectTab(this.index);
  },
  methods:{
    selectTab(index){
      this.index = index;
     this.tabs.forEach((tab, idx) =>{
       tab.isActive = idx === this.index;
     });
    }
  }
});
</script>

<style scoped lang="scss">
@import '../../theme/variables';

.inside-tabs{
  .header-btn{
    cursor: pointer;
  }
  .active{
    border-bottom: solid 4px map-get($theme-colors, 'primary');
    background-color:rgba( map-get($theme-colors, 'primary'), 0.05);
    transition: background-color 0.2s linear;
  }
}
</style>
