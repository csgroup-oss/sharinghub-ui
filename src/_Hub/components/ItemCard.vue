<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {router} from "@/init";
import {get} from "@/_Hub/tools/https";
import {DateTime, Interval} from "luxon";
import {PROXY_URL} from "@/_Hub/Endpoint";
import Utils from "@/utils";
import Awaiter from "@/_Hub/components/Awaiter.vue";
import {mapState} from "vuex";
import linuxIco from "@/assets/img/confused-linux.jpg";
import Description from "@/components/Description.vue";

export default defineComponent({
  name: "ItemCard",
  components: {
    Description,
    Awaiter,
    TextView,
  },
  props: {
    metadata: {
      type: Object,
      default: undefined
    },
    defaultPreview: {
      type: String,
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
    ...mapState(['auth', 'uiLanguage']),
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
        const lang = ["fr", "en"].includes(this.uiLanguage) ? this.uiLanguage : "en";
        return `${this.$t('fields.update_date', [date.setLocale(lang).toLocaleString({
          month: 'long',
          day: 'numeric',
          year: "numeric"
        })])}`;
      }
    },
    getDescription() {
      const regex = /!\[.*?\]\((.*?)\)|<img.*?>|\[.*\]?|\(https:.*?\) | \(<ul>.*.<\/ul>\) /g;
      const r = this.stac.properties.description.replace(regex, "");
      return r.substr(0, 160).concat(" ...");
    }
  },
  async beforeMount() {
    let url = this.$props.metadata.href;
    await get(url).then((response) => {
      if (response.data) {
        this.stac = response.data;
      }
    }).catch(() =>{
      this.$refs.card.style.display = "none";
    });
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
      return preview;
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
  <b-col ref="card" class="col-sm-12 col-md-6 col-lg-4 col-xl-3">
    <div @click="seeModel($event, $props.metadata.href)"
         v-if="!!this.stac" class="p-d-flex p-flex-column p-p-3 p-mt-5">
      <template v-if="loading">
        <div class="loading">
          <Awaiter type="small" :is-visible="loading"/>
        </div>
      </template>
      <template v-else>
        <div class="items-card">
          <div :class="['items-card__title p-d-flex p-flex-column', !getPreview() && 'no-preview']">
            <img v-if="getPreview()" :src="getPreview()">
            <div class="p-d-flex p-ai-center p-justify-end mt-2 mx-2">
              <b-badge variant="secondary">
                <b-icon icon="star-fill" scale="0.8" aria-hidden="true"></b-icon>
                {{ rankRate }}
              </b-badge>
            </div>
            <div v-if="!!stac.properties.keywords" class="p-d-flex p-ai-center  p-flex-wrap items-card__content__tag ">
              <b-badge v-for="tag in stac.properties.keywords.slice(0,6)" variant="primary" class="">
                {{ tag }}
              </b-badge>
            </div>

          </div>
          <div class="items-card__content p-px-3">
            <div class="p-d-flex w-100 h-100 p-flex-column p-jc-between py-3">
              <h3 class="items-card__content__title">
                <TextView type="header__b16">{{ stac.properties.title }}</TextView>
              </h3>

              <div class="items-card__content__description p-mb-3">
                <Description compact inline :description="getDescription"/>
              </div>

              <div class="items-card__content__extra" v-if="!!stac.properties.updated">
                <small class="">{{ updatedTime.charAt(0).toUpperCase() + updatedTime.slice(1) }}</small>
              </div>

            </div>
          </div>

        </div>
      </template>
    </div>
  </b-col>
</template>

<style scoped lang="scss">
@import "../../theme/variables.scss";

img {
  max-width: 100%;
  height: auto;
}

.loading {
  width: 300px;
  height: 360px;
}

.items-card {
  $root: &;
  display: flex;
  border-radius: 0.8rem;
  flex-direction: column;
  min-width: 300px;
  height: 360px;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  font-family: $headings-font-family;
  border: 1px #b5b9bb solid;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  .no-preview {
    background: rgba(black, 0.5);
  }

  &__title {
    height: 45%;
  }

  img {
    position: absolute;
    top: 0;
    width: 100%;
    height: 150px;
    object-fit: contain;
    object-position: center;
    z-index: -1;
    transform: scale(1.2);
    transition: 0.35s 0.35s transform cubic-bezier(.1, .72, .4, .97);
  }

  &__content {
    position: absolute;
    bottom: 0;
    width: 100%;
    height: 54%;

    &__title {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &__description {
      font-size: 12px;
      text-wrap: wrap;
      max-height: 51px;
    }

    &__tag {
      padding: 0 10px;

      .badge {
        margin: 1px;
      }
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
