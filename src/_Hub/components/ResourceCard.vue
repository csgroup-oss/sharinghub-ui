<script>
import {defineComponent} from 'vue';
import TextView from "@/_Hub/components/TextView.vue";
import {router} from "@/init";

export default defineComponent({
  name: "ResourceCard",
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
      owner: "https://aeiljuispo.cloudimg.io/v7/https://cdn-uploads.huggingface.co/production/uploads/1583646260758-5e64858c87403103f9f1055d.png?w=200&h=200&f=face"
    };
  },
  mounted() {
  },
  methods: {
    seeModel(event, id) {
      event.preventDefault();
      router.push({path: `model/${id}`});
    }
  }
});
</script>

<template>
  <div class="p-d-flex p-flex-column w-100 resource_card p-p-3 p-mt-5" @click="seeModel($event, $props.metadata.id)">
    <div class="p-d-flex p-ai-center p-mb-1">
      <img :src="owner" class="p-mr-1"/>
      <TextView>{{ $props.metadata.name }}</TextView>
    </div>
    <div class="p-d-flex p-ai-center">
      <div v-if="!!$props.metadata.keyword" class="p-text-secondary p-d-flex p-ai-center">
        <i class="pi pi-file-edit"/>
        <TextView type="Small-2">
          {{ $props.metadata.keyword }}
        </TextView>
      </div>
      <template v-if="!!$props.metadata.lastUpdated">
        <div class="p-text-secondary p-px-2">•</div>
        <div class="p-text-secondary p-d-flex p-ai-center">
          <TextView type="Small-2">
            {{ $props.metadata.lastUpdated }}
          </TextView>
        </div>
      </template>

      <template v-if="!!$props.metadata.downloadRate">
        <div class="p-text-secondary p-px-2">•</div>
        <div class="p-text-secondary p-d-flex p-ai-center">
          <i class="pi pi-arrow-down"/>
          <TextView type="Small-2">
            {{ $props.metadata.downloadRate }}
          </TextView>
        </div>
      </template>
      <template v-if="!!$props.metadata.likeRate">
        <div class="p-text-secondary p-px-2">•</div>
        <div class="p-text-secondary p-d-flex p-ai-center">
          <i class="pi pi-heart"/>
          <TextView type="Small-2">
            {{ $props.metadata.likeRate }}
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
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
