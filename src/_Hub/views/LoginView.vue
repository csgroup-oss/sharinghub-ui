<script>
import {defineComponent} from 'vue';
import {CONNEXION_MODE, get, setLocalToken} from "@/_Hub/tools/https";
import {PROXY_URL, USER_INFO, LOGIN_URL} from "@/_Hub/Endpoint";


export default defineComponent({
  name: "LoginView",
  data() {
    return {
      privateToken: undefined,
      login_url : LOGIN_URL
    };
  },
  methods: {
    go(e) {
      e.preventDefault();
      if (!this.privateToken)
        return;
      setLocalToken(this.privateToken);
      this.initWithUserCredentials();
    },
    setPrivateToken(token) {
      this.privateToken = token;
    },
    async initWithUserCredentials() {
      this.isLoading = true;
      get(PROXY_URL.concat('user'))
        .then(async (userDataResponse) => {
          if (userDataResponse.data) {
            let user = userDataResponse.data;
            let connexion_mode = CONNEXION_MODE.HEADLESS;
            this.$store.commit("setUserInfo", {user, token: this.privateToken, mode: connexion_mode});
            this.isLoading = false;
            this.$router.push("/");
          }
        });

    },
  }
});
</script>

<template>
  <div class="container w-50 p-pt-5">
    <div class="p-d-flex p-flex-column">
      <h2 class="p-mb-6"> Log in </h2>
      <b-row class="p-justify-between">
        <b-col cols="6">
          <b-form @submit="go">
            <b-form-group
              id="select-token" :label="$t('index.specifyToken')" label-for="token">
              <b-form-input id="token" type="password" :value="privateToken" @input="setPrivateToken"
                            placeholder="token..."/>
              <small> {{ $t('index.specifyTokenDetail') }} </small>
            </b-form-group>

            <b-button type="submit" variant="primary">{{ $t('index.load') }}</b-button>
          </b-form>
        </b-col>
        <b-col cols="1">
          <div class="p-divider--vertical"/>
        </b-col>
        <b-col class="p-as-center" cols="4">
          <b-button :href="login_url" variant="primary"> GitLab Oauth2</b-button>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
