<template v-if="isVisible">
  <div class="w-100">
    <b-skeleton animation="fade" width="85%" />
    <b-skeleton animation="fade" width="55%" />
    <b-skeleton animation="fade" width="70%" />
    <template v-if="type !== 'small'">
      <b-skeleton animation="fade" width="45%" />
      <b-skeleton animation="fade" width="85%" />
      <b-skeleton animation="fade" width="85%" />
      <b-skeleton animation="fade" width="80%" />
    </template>
  </div>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: 'Awaiter',
  props: {
    isVisible: {
      default: false,
      type: Boolean
    },
    type: {
      default: 'medium',
      type: String
    }
  }
});
</script>

<style scoped lang="scss">

</style>
