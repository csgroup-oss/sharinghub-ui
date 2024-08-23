<template>
  <div
    v-if="isMobile"
    v-bind="$attrs" v-on="$listeners"
    :class="['flex align-items-center py-1 px-1 nav-item']"
  >
    <i v-if="$props.icon !== undefined" :class="$props.icon +' '+ 'mr-2' " />
    <div class="flex align-items-center justify-content-between w-full">
      <text-view type="Title-2">
        <slot />
      </text-view>
      <a :href="createProjectLink" v-if="!!category && !!createProjectLink">
        <b-button
          @click="createNewProject"
          class="button_icon" size="small"
        >
          <b-icon
            scale="0.8" icon="plus-lg"
          />
        </b-button>
      </a>
    </div>
  </div>

  <div
    v-else
    v-bind="$attrs" v-on="$listeners"
    :class="['flex align-items-center py-1 px-1 nav-item']"
  >
    <i v-if="$props.icon !== undefined" :class="$props.icon +' '+ 'mr-2' " />
    <text-view type="Title-2">
      <slot />
    </text-view>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import TextView from '@/_Hub/components/TextView.vue';
import {mapState} from 'vuex';


export default defineComponent({
  name: 'NavItem',
  components: {TextView},
  props: {
    icon: {
      type: String,
      default: undefined
    },
    isMobile: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      default: undefined
    }
  },
  computed: {
    ...mapState(['provideConfig']),
    createProjectLink() {
      const {wizard} = this.provideConfig;
      const {url} = wizard;
      if (!url) {
        return null;
      }
      return `${url}${url.endsWith('/') ? '' : '/'}#/create-project?category=${this.category}&redirect_url=${window.location.origin}`;
    }
  },
  methods: {
    createNewProject(event) {
      event.stopPropagation();
    }
  }
});
</script>


<style scoped lang="scss">
@import "../../../assets/colors";

.nav-item {
  cursor: pointer;
  transition: background-color linear 0.2s;
  .button_icon {
    height: 30px;
    width: 30px;
    padding: 1px;
  }

  &:hover {
    background: rgba($primary-color, 0.5);
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
