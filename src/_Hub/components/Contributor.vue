<template>
  <div>
    <div v-if="isLoading">
      <b-skeleton size="3rem" type="avatar" />
    </div>
    <template v-else>
      <a target="_blank" v-if="userInfo" :href="userInfo.web_url">
        <b-avatar
          ref="avatarRef"
          variant="primary"
          size="3rem"
          v-b-tooltip.hover.bottom :title="userInfo.name"
          :id="userInfo.avatar_url" :src="userInfo.avatar_url"
          @img-error="loadError"
        />
      </a>
      <a v-else target="_blank" :href="`mailto:${userDetail.email}`">
        <b-avatar variant="primary" size="3rem" v-b-tooltip.hover.bottom :title="userDetail.name">
          <span class="font-bold uppercase" v-if="splitName()">{{ splitName() }}</span>
        </b-avatar>
      </a>
    </template>
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
    userDetail: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      userInfo: undefined,
      isLoading: true
    };
  },
  async beforeMount() {
    this.userInfo = await this.fetchUserInfo(this.userDetail.name);
  },
  methods: {

    splitName() {
      const array = this.userDetail.name.split(' ');
      if (array?.length !== 0) {
        return array.length > 1 ? array[0].charAt(0) + array[1].charAt(0) : array[0].charAt(0);
      }
    },
    fetchUserInfo(name) {
      this.isLoading = true;
      return get(`${PROXY_URL}users?search=${encodeURIComponent(name)}`)
          .then((response) => {
            if (response.data && response.data.length !== 0) {
              this.isLoading = false;
              return response.data[0];
            }
            this.isLoading = false;
          });
    },

    async loadError() {
      const ref = this.$refs.avatarRef.$el;
      get(`${PROXY_URL}/avatar?email=${this.userDetail.email}`)
           .then((resp) =>{
             if(resp.data){
               const {avatar_url} = resp.data;
               ref.innerHTML = `<span class="b-avatar-img"><img src="${avatar_url}"></span>`;
             }
           });
    }
  }
});
</script>

<style scoped lang="scss">

</style>
