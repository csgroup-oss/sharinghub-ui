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
    detectTypo () {
       return `text__${this.$props.type}`;
    }
  },
  mounted() {

  },
  methods: {}

});
</script>


<style scoped lang="scss">

@import "../../theme/variables.scss";

.text {
  font-family: $font-family-sans-serif;

  &__header {
    &__13 {
      font-size: 13.5px;
    }

    &__b13 {
      font-size: 13.5px;
      font-weight: 700;
    }

    &__14 {
      font-size: 14px;
    }

    &__b14 {
      font-size: 14px;
      font-weight: 700;
    }

    &__15 {
      font-size: 14px;
    }

    &__b15 {
      font-size: 15px;
      font-weight: 700;
    }

    &__16 {
      font-size: 16px;
    }

    &__b16 {
      font-size: 16px;
      font-weight: 700;
    }

    &__20 {
      font-size: 20px;
    }

    &__b20 {
      font-size: 20px;
      font-weight: 800;
    }
  }

  &__Small {
    &-1 {
      font-size: 0.9rem;
    }

    &-2 {
      font-size: 0.75em;
    }

    &-3 {
      font-size: 0.7em;
      letter-spacing: 1px;
    }
  }
}
</style>
