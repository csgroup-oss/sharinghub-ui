<template>
  <div>
    <a target="_blank" v-if="userInfo" :href="userInfo.web_url">
      <b-avatar
        size="3rem"
        v-b-tooltip.hover.bottom :title="userInfo.name"
        :id="userInfo.id" :src="userInfo.avatar_url"
      />
    </a>
    <div v-else>
      <b-skeleton size="3rem" type="avatar" />
    </div>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import {get} from '@/_Hub/tools/https';
import {PROXY_URL} from '@/_Hub/Endpoint';

export default defineComponent({
  name: 'Contributor',
  components: {},
  props: {
    name: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      userInfo: undefined
    };
  },
  async beforeMount() {
    this.userInfo = await this.fetchUserInfo(this.name);
  },
  methods: {
    fetchUserInfo(name) {
      return get(`${PROXY_URL}users?search=${name}`)
        .then((response) => {
          if (response.data && response.data.length !== 0) {
            return response.data[0];
          }
        });
    }
  }
});
</script>

<style scoped lang="scss">

</style>
