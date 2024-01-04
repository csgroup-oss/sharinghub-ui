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
      <div class="card-hover">
        <div class="p-d-flex p-ai-center p-justify-end  mt-2" v-if="!!stac.properties.keywords">
          <b-badge variant="info" class="mx-1">{{ stac.properties.keywords[0] }}</b-badge>
          <b-badge variant="info mx-1">{{ stac.properties.keywords[4] }}</b-badge>
          <b-badge variant="light">
            <b-icon icon="star-fill" scale="0.8" aria-hidden="true"></b-icon>
            {{ rankRate }}
          </b-badge>

        </div>
        <div class="card-hover__content">
          <div class="card-hover__title">
            <TextView type="header__b16">{{ stac.properties.title }}</TextView>
          </div>
          <p class="card-hover__text">
            <Description compact inline :description="getDescription"/>
          </p>
          <a href="#" class="card-hover__link">
            <span>More info</span>
          </a>
        </div>
        <div class="card-hover__extra">
          <div>
            <div v-if="!!stac.properties.updated">
              <small class="p-text-capitalize">
                <span class="p-text-secondary px-2">•</span>
                {{ updatedTime }}</small>
            </div>
          </div>
        </div>
        <img :src="getPreview()">
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

.card-hover {
  $root: &;
  width: 360px;
  height: 300px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease-in-out;
  cursor: pointer;
  font-family: $headings-font-family;
  border-radius: 0.8rem;
  border: 1px #b5b9bb solid;

  &:has(#{$root}__link:hover) {
    #{$root}__extra {
      transform: translateY(0);
      transition: transform 0.35s;
    }
  }

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);

    #{$root} {
      &__content {
        background-color: rgba(map-get($theme-colors, 'info'), 1);
        opacity: 1;
        color: white;
        bottom: 100%;
        transform: translateY(100%);
        padding: 4px 8px;
        transition: all 0.35s cubic-bezier(.1, .72, .4, .97);
        h1,h2,h3,h4,h5{
          color: #FFFFFF !important;
        }
      }

      &__title {
        span {
          color: #FFFFFF !important;
        }
      }

      &__link {
        color: #FFFFFF;
        font-weight: 800;
        opacity: 1;
        transform: translate(-50%, 0);
        transition: all 0.3s 0.35s cubic-bezier(.1, .72, .4, .97);
      }

    }

    img {
      transform: scale(1);
      transition: 0.35s 0.1s transform cubic-bezier(.1, .72, .4, .97);
    }

  }

  .pi {
    font-size: 0.8rem;
    margin-right: 2px;
  }

  &:after {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  &__content {
    width: 100%;
    text-align: center;
    background-color: #FFFFFF;
    padding: 0 4px 8px;
    position: absolute;
    bottom: 0;
    left: 0;
    transform: translateY(0);
    transition: all 0.35s 0.35s cubic-bezier(.1, .72, .4, .97);
    will-change: bottom, background-color, transform, padding;
    z-index: 1;

    &::before,
    &::after {
      content: '';
      width: 100%;
      height: 120px;
      background-color: inherit;
      position: absolute;
      left: 0;
      z-index: -1;
    }

    &::before {
      top: -80px;
      clip-path: ellipse(60% 80px at bottom center);
    }

    &::after {
      bottom: -80px;
      clip-path: ellipse(60% 80px at top center);
    }
  }

  &__title {
    font-size: 1.5rem;
    margin-bottom: 1em;

    span {
      color: map-get($theme-colors, 'primary');
    }
  }

  &__text {
    font-size: 0.82rem;
  }

  &__link {
    position: absolute;
    bottom: -2.5rem;
    left: 50%;
    transform: translate(-50%, 10%);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    text-decoration: none;
    color: map-get($theme-colors, 'secondary');
    opacity: 0;
    padding: 10px;
    transition: all 0.35s;

    &:hover {
      svg {
        transform: translateX(4px);
      }
    }

    svg {
      width: 18px;
      margin-left: 4px;
      transition: transform 0.3s;
    }
  }

  &__extra {
    height: 50%;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;
    text-align: center;
    background-color: #FFFFFF;
    padding: 20px;
    bottom: 0;
    z-index: 0;
    color: #000000;
    transform: translateY(100%);
    will-change: transform;
    transition: transform 0.35s;

    span {
      color: map-get($theme-colors, "primary");
    }
  }

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: -1;
    transform: scale(1.2);
    transition: 0.35s 0.35s transform cubic-bezier(.1, .72, .4, .97);
  }
}


</style>
