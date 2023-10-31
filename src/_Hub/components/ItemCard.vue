<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {router} from "@/init";
import {get} from "@/_Hub/services/https";
import {DateTime, Interval} from "luxon";

export default defineComponent({
  name: "ItemCard",
  components: {
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
      owner: "https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/1583646260758-5e64858c87403103f9f1055d.png?w=200&h=200&f=face",
      stac: undefined,
    };
  },
  async created() {

  },
  async mounted() {
    this.stac = (await get(this.$props.metadata.href)).data;
  },
  computed: {},
  methods: {
    seeModel(event, url) {
      event.preventDefault();
      router.push({path: `/metadata`, query:{"external":url}});
    },
    updatedTime(data) {
      const now = DateTime.now();
      const date = DateTime.fromISO(data);
      const interval = Interval.fromDateTimes(date, now);
      const hours = interval.length('hours');
      const days = interval.length('days');
      if (hours <= 24) {
        return `Updated about ${Math.round(hours)} hour(s) ago`;
      } else if (days <= 30) {
        return `Updated about ${Math.round(days)} day(s) ago`;
      } else {
        return `Updated ${date.toLocaleString({ month: 'long', day: 'numeric' , year:"numeric" })}`;
      }
    },
    getPreview() {
      return  this.stac.links.find(el => el.rel === "preview")?.href || this.owner;
    }
  }
});
</script>

<template >
  <div
    @click="seeModel($event, $props.metadata.href)"
    v-if="!!this.stac" class="p-d-flex p-flex-column w-100 resource_card p-p-3 p-mt-5">
    <div class="p-d-flex p-ai-center p-mb-1">
      <img :src="getPreview()" class="p-mr-1"/>
      <TextView>{{ this.stac.properties.title }}</TextView>
    </div>
    <div class="p-d-flex p-ai-center">
      <div v-if="!!this.stac.properties.keywords" class="p-text-secondary p-d-flex p-ai-center">
        <i class="pi pi-file-edit"/>
        <TextView type="Small-2">
          {{ this.stac.properties.keywords[0] }}
        </TextView>
      </div>
      <template v-if="!!this.stac.properties.updated">
        <div class="p-text-secondary p-px-2">•</div>
        <div class="p-text-secondary p-d-flex p-ai-center">
          <TextView type="Small-2">
            {{ updatedTime(this.stac.properties.updated) }}
          </TextView>
        </div>
      </template>

      <template v-if="!!this.stac.properties.updated">
        <div class="p-text-secondary p-px-2">•</div>
        <div class="p-text-secondary p-d-flex p-ai-center">
          <i class="pi pi-arrow-down"/>
          <TextView type="Small-2">
            {{ "12.3M" }}
          </TextView>
        </div>
      </template>
      <template v-if="!!this.stac.properties.updated">
        <div class="p-text-secondary p-px-2">•</div>
        <div class="p-text-secondary p-d-flex p-ai-center">
          <i class="pi pi-heart"/>
          <TextView type="Small-2">
            {{ "5.5K" }}
          </TextView>
        </div>
      </template>
    </div>
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
