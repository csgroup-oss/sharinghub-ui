<template>
  <div class="vue-component search-box">
    <span class="icon">🔎</span>
    <b-form-input type="search" v-model.trim="searchTerm" :placeholder="placeholder || $t('search.placeholder')" />
  </div>
</template>

<script>
import { BFormInput } from 'bootstrap-vue';

export default {
  name: 'SearchBox',
  components: {
    BFormInput
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    placeholder: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      searchTerm: this.value
    };
  },
  watch: {
    searchTerm(newValue) {
      if (newValue.length < this.minLength) {
        newValue = '';
      }
      this.$emit('input', newValue);
    }
  }
};
</script>

<style lang="scss">
#stac-browser .search-box {
  position: relative;

  input, .icon {
    height: 1.5em;
    font-size: 1em;
    margin: 0;
  }
  input {
    padding: 0.25em 0.3em;
    padding-left: 1.9em;
    z-index: 1;
    display: inline-block;
    border: 1px solid #ccc;
    box-sizing: content-box;
    background-color: #fff;
    width: calc(100% - 1.9em - 0.25em - 2px);
  }
  .icon {
    user-select: none;
    margin-top: 0.3em;
    margin-left: 0.3em;
    width: 1em;
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;
  }
}
</style>
