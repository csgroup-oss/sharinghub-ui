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
import linuxIco from "@/assets/img/linux.png";

export default defineComponent({
  name: "ItemCard_",
  components: {
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
      return  preview  || this.owner;
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
    }
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
      <div class="p-d-flex p-ai-center p-mb-1">
        <img :src="getPreview()" class="p-mr-1"/>
        <TextView>{{ this.stac.properties.title }}</TextView>
      </div>
      <div class="p-d-flex p-ai-center">
        <div v-if="!!this.stac.properties.keywords" class="p-text-secondary p-d-flex p-ai-center">
          <b-icon scale="0.8" icon="file-earmark-code"/>
          <TextView type="Small-2">
            {{ this.stac.properties.keywords[0] }}
          </TextView>
        </div>
        <template v-if="!!this.stac.properties.updated">
          <div class="p-text-secondary p-px-2">•</div>
          <div class="p-text-secondary p-d-flex p-ai-center">
            <TextView type="Small-2">
              {{ updatedTime }}
            </TextView>
          </div>
        </template>
        <template v-if="!!rankRate">
          <div class="p-text-secondary p-px-2">•</div>
          <div class="p-text-secondary p-d-flex p-ai-center">
            <TextView type="Small-1">
              {{ rankRate }}
            </TextView>
            <b-icon-heart scale="0.65"/>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.resource_card {
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  &:after {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
  }

  cursor: pointer;
  border-radius: 0.8rem;
  border: 1px #b5b9bb solid;

  .pi {
    font-size: 0.8rem;
    margin-right: 2px;
  }

  img {
    border-radius: 0.25rem;
    width: 1.275rem;
    height: 1.275rem;
  }
}
</style>
