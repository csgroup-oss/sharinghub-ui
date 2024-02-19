<template>
  <div class="inline-flex align-items-center tag-custom px-2">
    <i v-if="!!$props.icon" :class="'mr-1 py-1 ' + $props.icon"/>
    <text-view type="Small-3" class="py-1">{{ label }}</text-view>
    <template v-if="!!$props.subLabel">
      <div class="p-divider--vertical" />
      <text-view type="Small-3" class="p-text-secondary ">{{ subLabel }}</text-view>
    </template>
  </div>
</template>


<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";

export default defineComponent({
  name: "TagCustom",
  components: {TextView},
  props: {
    icon: {
      default: undefined,
      type: String
    },
    label: {
      required: true,
      default: undefined,
      type: String
    },
    subLabel: {
      default: undefined,
      type: String
    }
  },
});
</script>

<style scoped lang="scss">
@import "src/assets/colors";

.tag-custom {
  border: rgba($secondary-color, 0.5) 0.5px solid;
  border-radius: 0.5em;

  .pi {
    font-size: 14px;
  }
}
</style>
