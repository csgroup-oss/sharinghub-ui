<template>
  <span :class="'text ' + detectTypo">
    <slot/>
  </span>
</template>

<script>
import {defineComponent} from 'vue';

export default defineComponent({
  name: "TextView",
  props: {
    type: {
      type: String,
      default: ""
    }
  },

  data() {
    return {};
  },
  computed: {
    detectTypo: function () {
      switch (this.$props.type) {
        case "Title_1":
          return `text__Title-1`;
        default:
          return `text__Title-1`;
      }
    }
  },
  mounted() {

  },
  methods: {

  }

});
</script>


<style scoped lang="scss">

.text {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
  Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
  "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  &__Title-1 {
    font-size: 1.125rem;
    line-height: 1.75rem;
    font-weight: 700;
  }
}
</style>