<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {router} from "@/init";
import {CONNEXION_MODE, get} from "@/_Hub/tools/https";
import {DateTime, Interval} from "luxon";
import {PROXY_URL} from "@/_Hub/Endpoint";
import Utils from "@/utils";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import {mapState} from "vuex";
import linuxIco from "@/assets/img/confused-linux.jpg";
import Description from "@/components/Description.vue";

export default defineComponent({
  name: "ItemCard2",
  components: {
    Description,
    Awaiter,
    TextView,
  },
  props: {
    metadata: {
      type: Object,
      default: undefined
    }
  },
  data() {
    return {
      owner: linuxIco,
      stac: undefined,
      loading: true,
      rankRate: 0,
    };
  },
  computed: {
    ...mapState(['auth']),
    updatedTime() {
      const data = this.stac.properties.updated;
      const now = DateTime.now();
      const date = DateTime.fromISO(data);
      const interval = Interval.fromDateTimes(date, now);
      const hours = interval.length('hours');
      const days = interval.length('days');
      if (hours <= 24) {
        return `${this.$t('fields.update_hours', [Math.round(hours)])}`;
      } else if (days <= 30) {
        return `${this.$t('fields.update_days', [Math.round(days)])}`;
      } else {
        return `${this.$t('fields.update_date', [date.toLocaleString({
          month: 'long',
          day: 'numeric',
          year: "numeric"
        })])}`;
      }
    },
    getDescription() {
      const regex = /!\[.*?\]\((.*?)\)|<img.*?>|\[.*\]?|\(https:.*?\)/g;
      const r = this.stac.properties.description.replace(regex, "");
      return r.substr(0, 120).concat(" ...");
    }
  },
  async beforeMount() {
    let url = this.$props.metadata.href;
    this.stac = (await get(url)).data;
    const projectID = Utils.getProjectID(this.stac.id);
    if (projectID) {
      this.getStarProject(projectID);
    }
  },
  methods: {
    seeModel(event, url) {
      event.preventDefault();
      router.push({path: `/metadata`, query: {"external": url}});
    },
    getPreview() {
      let preview = this.stac.links.find(el => el.rel === "preview")?.href;
      if (preview) {
        if (this.auth.mode !== CONNEXION_MODE.CONNECTED && !preview.includes("gitlab_token")) {
          preview = preview.concat(`?gitlab_token=${this.auth.token}`);
        }
      } else {
        preview = this.owner;
      }
      return preview || this.owner;
    },
    getStarProject(url) {
      this.loading = true;
      get(PROXY_URL.concat(`projects/${url}/starrers`))
        .then((response) => {
          if (response.data) {
            this.rankRate = response.data.length;
            this.loading = false;
          }
        }).catch(reason => {
        console.log('error', reason);
        this.loading = false;
      });
    },

  }
});
</script>

<template>
  <div @click="seeModel($event, $props.metadata.href)"
       v-if="!!this.stac" class="p-d-flex p-flex-column w-100 resource_card p-p-3 p-mt-5">
    <template v-if="loading">
      <Awaiter type="small" :is-visible="loading"/>
    </template>
    <template v-else>
      <div class="items-card">
        <div>
          <img :src="getPreview()">
          <div class="p-d-flex p-ai-center p-justify-end mt-2 mx-2">
            <b-badge variant="light">
              <b-icon icon="star-fill" scale="0.8" aria-hidden="true"></b-icon>
              {{ rankRate }}
            </b-badge>
          </div>
          <div v-if="!!stac.properties.keywords" class="p-d-flex p-ai-center  p-flex-wrap">
            <b-badge v-for="tag in stac.properties.keywords.slice(0,6)" variant="info" class="m-1">
              {{ tag }}
            </b-badge>
          </div>

        </div>
        <div class="items-card__content p-px-3">
          <div class="p-d-flex w-100 h-100 p-flex-column">
            <h3 class="items-card__content__title">
              <TextView type="header__b16">{{ stac.properties.title }}</TextView>
            </h3>

            <div class="items-card__content__description">
              <Description compact inline :description="getDescription"/>
            </div>

            <h3 class="p-d-flex p-jc-center mt-1">
              <b-button size="sm" variant="primary"> {{ $t('showMore') }}</b-button>
            </h3>

            <div class="items-card__content__extra" v-if="!!stac.properties.updated">
              <small class="">
                <span class="p-text-secondary px-2">•</span>
                {{ updatedTime }}</small>
            </div>

          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
@import "../../theme/variables.scss";

img {
  max-width: 100%;
  height: auto;
}

.items-card {
  $root: &;
  width: 300px;
  height: 320px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease-in-out;
  cursor: pointer;
  font-family: $headings-font-family;
  border-radius: 0.8rem;
  border: 1px #b5b9bb solid;



  img {
    position: absolute;
    top: 0;
    width: 100%;
    height: 150px;
    object-fit: cover;
    object-position: center;
    z-index: -1;
    transform: scale(1);
    transition: 0.35s 0.35s transform cubic-bezier(.1, .72, .4, .97);
  }

  &__content {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 45%;

    &__title {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__description {
      font-size: 12px;
    }
  }

  small {
    font-size: 12px;
  }

  .btn-sm {
    height: 20px;
    font-size: 12px;
    padding: 1px;
  }
}


</style>
