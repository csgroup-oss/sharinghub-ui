<template>
  <li v-if="!!dataLink">
    <StacLink :id="popoverId" :data="dataLink" :fallbackTitle="fallbackTitle" class="pr-1" />
    <b-popover :target="popoverId" triggers="hover" placement="right" container="#stac-browser">
      <h6 class="small text-muted text-center">{{ $t('additionalActions') }}</h6>
      <HrefActions vertical :data="dataLink" size="sm" />
    </b-popover>
  </li>
</template>

<script>
import HrefActions from './HrefActions.vue';
import StacLink from './StacLink.vue';
import {BPopover} from 'bootstrap-vue';
import Utils from '@/utils';


export default {
  name: 'Link',
  components: {
    BPopover,
    HrefActions,
    StacLink
  },
  props: {
    link: {
      type: Object,
      required: true
    },
    fallbackTitle: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      dataLink: undefined
    };
  },
  computed: {
    popoverId() {
      return 'popover-link-' + `${Utils.stringToHash(this.link.title)}`;
    }
  },
  async mounted() {
    if (Utils.isMlModeltrainData(this.link.rel)) {
      this.hrefBrowserLink = await Utils.browsifyUrl(this.link.href);
      let base = Object.assign({target:'_blank'}, this.link);
      this.dataLink = Object.assign(base, {href: this.hrefBrowserLink});
    } else {
      this.dataLink = this.link;
    }

  }

};
</script>
