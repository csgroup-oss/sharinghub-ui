<template>
  <div v-show="isActive" :data-id="title">
    <slot />
  </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'InsideTab',
  props:{
    title : {
      type: String,
      required: true
    }
  },
  data(){
    return{
      isActive: false
    };
  }
});
</script>

<style scoped lang="scss">

</style>
