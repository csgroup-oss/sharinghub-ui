<template>
  <b-col ref="card" class="col-sm-12 col-md-6 col-lg-4 col-xl-3 mt-2 p-0 ">
    <div @click="seeModel($event)" v-if="!!stac" class="flex flex-column p-3 ">
      <div class="items-card">
        <div :class="['items-card__title flex flex-column', !getPreview() && 'no-preview']">
          <img v-if="getPreview()" :src="getPreview()">
          <div class="flex align-items-center justify-content-end my-2 mx-2">
            <b-badge variant="secondary">
              <b-icon icon="star-fill" scale="0.8" aria-hidden="true"></b-icon>
              {{ starsProject }}
            </b-badge>
          </div>
          <div v-if="!!stac.properties.keywords" class="flex align-items-center flex-wrap items-card__content__tag ">
            <b-badge
              v-for="tag,idx in stac.properties.keywords.slice(0,6)"
              variant="primary"
              :key="idx"
              @click="$event =>handleFilterByTag($event, tag)"
            >
              {{ tag }}
            </b-badge>
          </div>

          <div class="w-100 flex align-items-center pl-2 items-card__category" v-if="!!category">
            <text-view type="header__13">
              <small>{{ category }}</small>
            </text-view>
          </div>

        </div>
        <div class="items-card__content px-3">
          <div class="flex w-100 h-100 flex-column justify-content-between py-3">
            <h3 class="items-card__content__title">
              <TextView type="header__b16">{{ stac.properties.title }}</TextView>
            </h3>

            <div class="items-card__content__description mb-3">
              <Description compact inline :description="getDescription"/>
            </div>

            <div class="items-card__content__extra" v-if="!!updatedTime">
              <small class="">{{ updatedTime.charAt(0).toUpperCase() + updatedTime.slice(1) }}</small>
            </div>

          </div>
        </div>

      </div>
    </div>
  </b-col>
</template>

<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {DateTime, Interval} from "luxon";
import {mapGetters, mapState} from "vuex";
import linuxIco from "@/assets/img/confused-linux.jpg";
import Description from "@/components/Description.vue";

export default defineComponent({
  name: "ItemCard",
  components: {
    Description,
    TextView,
  },
  props: {
    stac: {
      type: Object,
      default: undefined
    },
    category: {
      type: String,
      default: undefined,
    }
  },
  data() {
    return {
      owner: linuxIco,
      rankRate: 0,
    };
  },
  computed: {
    ...mapState(['auth', 'uiLanguage', 'data']),
    ...mapGetters(['toBrowserPath']),
    updatedTime() {
      const data = this.stac.properties.datetime;
      const now = DateTime.now();
      const date = DateTime.fromISO(data);
      const interval = Interval.fromDateTimes(date, now);
      const hours = interval.length('hours');
      const days = interval.length('days');
      if (hours <= 24) {
          if(hours < 1){
            return `${this.$t('fields.date.update_less_hour', [Math.round(hours)])}`; 
          }
        return `${this.$t('fields.date.update_hours', [Math.round(hours)])}`;
      } else if (days <= 30) {
        return `${this.$t('fields.date.update_days', [Math.round(days)])}`;
      } else {
        const lang = ["fr", "en"].includes(this.uiLanguage) ? this.uiLanguage : "en";
        return `${this.$t('fields.date.update_date', [date.setLocale(lang).toLocaleString({
          month: 'long',
          day: 'numeric',
          year: "numeric"
        })])}`;
      }
    },
    getDescription() {
      const regex = /!\[.*?\]\((.*?)\)|<img.*?>|\[.*\]?|\(https:.*?\) | \(<ul>.*.<\/ul>\) /g;
      const r = this.stac.properties?.description?.replace(regex, "") || " ";
      return r.substr(0, 120).concat(" ...");
    },
    getUrl() {
      return this.toBrowserPath(this.stac.links.find(el => el.rel === "self").href);
    },
    starsProject() {
      return this.stac.properties['sharinghub:stars'];
    }
  },
  async beforeMount() {
  },
  methods: {
    seeModel(event) {
      event.preventDefault();
      this.$router.push({path: `/${this.getUrl.split('/').splice(3).join("/")}`,});
    },
    getPreview() {
      return this.stac.links.find(el => el.rel === "preview")?.href;
    },
    handleFilterByTag(event, tag) {
      event.stopImmediatePropagation();
      const {topics, q, sortby} = this.$route.query;
      const topics_array = topics?.split(",") || []
      if(topics_array.includes(tag)) {
        return;
      }
      topics_array.push(tag)
      let query = {topics : topics_array.join(',')};
       if(q){
         query = {...query, q};
       }
       if(sortby){
         query = {...query, sortby};
       }
       this.$router.push({path: "", query});

    }
  }
});
</script>


<style scoped lang="scss">
@import "../../theme/variables.scss";

a {
  all: none;
}

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
    background: rgba(black, 0.1);
  }

  &__category {
    background: rgba(map-get($theme-colors, "primary"), 0.6);
    color: white;
    top: 135px;
    position: absolute;
    height: 30px;

    small {
      font-variant-caps: small-caps;
      font-size: 15px !important;
    }
  }

  &__title {
    height: 46%;
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
      max-height: 51px;
    }

    &__tag {
      padding: 0 10px;

      .badge {
        margin: 1px;
        opacity: 0.9;

        &:hover {
          opacity: 1;
        }
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

@media screen and (max-width: 575px) {
  .col{
    &-sm-12{
    width: 100% !important;
      min-width: 300px;
      height: fit-content;
    }
  }
}
</style>
