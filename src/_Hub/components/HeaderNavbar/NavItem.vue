<template>
  <div v-bind="$attrs" v-on="$listeners" :class="['p-d-flex p-ai-center p-py-1 p-px-2', $props.isSimple ?'nav-item-simple' : 'nav-item']">
    <i v-if="$props.icon !== undefined" :class="$props.icon +' '+ 'p-mr-2' "></i>
    <text-view type="Title-2">
      <slot/>
    </text-view>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";

export default defineComponent({
  name: "NavItem",
  components: {TextView},
  props: {
    icon: {
      type: String,
      default: undefined
    },
    isSimple: {
      type: Boolean,
      default: false
    },
  },
});
</script>


<style scoped lang="scss">
@import "../../../assets/colors";

.nav-item {
  cursor: pointer;
  transition: background-color linear 0.2s;
  border-radius: 16px;

  &:hover {
    background: rgba($primary-color, 0.5);
    //color: $primary-color-inverted;
    border-radius: 16px;
    transition: background-color linear 0.2s;
  }

  &-simple {
    cursor: pointer;
    &:hover {
      color: $primary-color;
      transition: color linear 0.2s;
    }
  }
}
</style>
