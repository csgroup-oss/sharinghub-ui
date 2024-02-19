<script>
import { defineComponent } from "vue";
import { CONNEXION_MODE, get, setLocalToken } from "@/_Hub/tools/https";
import { PROXY_URL, LOGIN_URL } from "@/_Hub/Endpoint";
import { mapState } from "vuex";

export default defineComponent({
  name: "LoginView",
  data() {
    return {
      privateToken: undefined,
      login_url: LOGIN_URL,
    };
  },
  computed: {
    ...mapState(["pathPrefix"]),
    connexion_url() {
      const { redirect } = this.$route.query;
      const url = redirect
        ? `${this.login_url}${this.pathPrefix}?redirect=${redirect}`
        : this.login_url;
      return url;
    },
  },
  methods: {
    go(e) {
      e.preventDefault();
      if (!this.privateToken) return;
      setLocalToken(this.privateToken);
      this.initWithUserCredentials();
    },
    setPrivateToken(token) {
      this.privateToken = token;
    },
    async initWithUserCredentials() {
      this.isLoading = true;
      get(PROXY_URL.concat("user")).then(async (userDataResponse) => {
        if (userDataResponse.data) {
          let user = userDataResponse.data;
          let connexion_mode = CONNEXION_MODE.PRIVATE_TOKEN;
          this.$store.commit("setUserInfo", {
            user,
            token: this.privateToken,
            mode: connexion_mode,
          });
          this.isLoading = false;
          const { redirect } = this.$route.query;
          if(redirect){
            this.$router.push({path:`/${redirect}`});
          }else{
            this.$router.push("/");
          }
        }
      });
    },
  },
});
</script>

<template>
  <div class="container md:w-6 lg:w-6 sm:w-6 pt-5">
    <div class="flex flex-column">
      <h2 class="mb-6 sm:align-self-center md:align-self-center lg:align-self-start xl:align-self-start">Log in</h2>
      <div class="flex justify-content-between lg:flex-row md:flex-row xl:flex-row sm:flex-column-reverse">
        <div class="col-sm-12 col-md-6 col-lg-12 col-xl-6">
          <b-form @submit="go">
            <b-form-group
              id="select-token"
              :label="$t('index.specifyToken')"
              label-for="token"
            >
              <b-form-input
                id="token"
                type="password"
                :value="privateToken"
                @input="setPrivateToken"
                placeholder="token..."
              />
              <small> {{ $t("index.specifyTokenDetail") }} </small>
            </b-form-group>
            <b-button type="submit" block variant="primary">{{
              $t("index.load")
            }}</b-button>
          </b-form>
        </div>
        <div class="col-sm-12 col-md-1 col-lg-1 col-xl-1 sm:my-3">
          <div class="p-divider--vertical sm:hidden lg:block" />
          <div class="p-divider--horizontal sm:block lg:hidden"  />
        </div>
        <div class="p-as-center col-sm-12 col-md-4 col-lg-4 col-xl-4">
          <b-button :href="connexion_url" block variant="primary">
            GitLab Oauth2</b-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.lg\:{
   &hidden{
     display: none !important;
   }
  &block{
    display: block !important;
  }
}
@media screen and (max-width: 575px) {
  .container{
    .sm\:{
      &flex-column-reverse{
        flex-direction: column-reverse !important;
      }
      &my-3{
        margin: 1rem auto;
      }
      &hidden{
       display: none !important;
      }
      &block{
        display: block !important;
      }
      &align-self-center{
        align-self: center ;
      }
    }
  }
}

</style>
