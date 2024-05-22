<template>
  <div class="homeCard">
    <template v-if="index % 2 === 0">
      <div class="mr-6">
        <div class="illustration" :style="{backgroundImage: `url(${logo})`}" />
      </div>
      <div class="text-block ">
        <div class="mt-3">
          <h3> {{ title }} </h3>
          <Description v-if="!!description" :description="description" />
        </div>
        <b-button class="mb-2" :to="category"> {{ $t('showMore') }}</b-button>
      </div>
    </template>

    <template v-else>
      <div class="flex w-100 justify-content-end sm-card">
        <div class="text-block-2">
          <div class="mt-3">
            <h3> {{ title }} </h3>
            <Description v-if="!!description" :description="description" />
          </div>
          <b-button class="mb-2" :to="category"> {{ $t('showMore') }}</b-button>
        </div>
        <div class="ml-6">
          <div class="illustration-2" :style="{backgroundImage: `url(${logo})`}" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import {defineComponent} from 'vue';
import Description from '@/components/Description.vue';

export default defineComponent({
  name: 'HomeCard',
  components: {Description},
  props: {
    category: {
      type: String,
      default: ''
    },
    index: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    logo: {
      type: String,
      default: 'https://images.unsplash.com/photo-1557187666-4fd70cf76254?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=60'
    },
    link: {
      type: String,
      default: null
    }
  },
  data() {
    return {};
  },
  computed: {
    links() {
      return '';
    }
  }
});
</script>

<style scoped lang="scss">

.homeCard {
  display:flex;
  border-radius: 24px;
  position: relative;
  width: 100%;
  height: 200px;
  margin-bottom: 8px;
  background-color: #fff;
  border: 2px solid #ddd;
  font-size: 18px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 4px 21px -12px rgba(0, 0, 0, .66);
  transition: box-shadow 0.2s ease, transform 0.2s ease;

  &:hover {
    box-shadow: 0 34px 32px -33px rgba(0, 0, 0, .18);
    transform: translate(0px, -3px);
  }


  .illustration {
    margin-right: 3rem;
    cursor: pointer;
    background-size: cover;
    background-position: center;
    width: 200px;
    height: 240px;
    border-radius: 24px;
    bottom: 0;
    filter: brightness(0.75) saturate(1.2) contrast(0.85);
    transform-origin: center;
    transform: scale(1) translateZ(0);
    transition: filter 200ms linear,
    transform 200ms linear;

    &:hover {
      filter: brightness(0.8) saturate(1) contrast(1.2);
      transform: scale(1.08) rotate(3deg);
    }
  }

  .text-block {
    margin-right: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 8px;

    &:before {
      content: " ";
      padding-top: 10px;
      position: absolute;
      display: block;
      background: #fff;
      left: 168px;
      height: 104%;
      width: 50px;
      transform: rotate(8deg);
    }
  }

  .illustration-2 {
    cursor: pointer;
    background-size: cover;
    background-position: center;
    width: 200px;
    height: 240px;
    border-radius: 24px;
    bottom: 0;
    filter: brightness(0.75) saturate(1.2) contrast(0.85);
    transform-origin: center;
    transform: scale(1) translateZ(0);
    transition: filter 200ms linear,
    transform 200ms linear;
    //transform: scale(1.08) rotate(3deg);

    &:hover {
      filter: brightness(0.8) saturate(1) contrast(1.2);
      transform: scale(1.08) rotate(3deg);
    }
  }

  .text-block-2 {
    flex: 2;
    margin-left: 32px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 8px;

    &:before {
      content: "";
      padding-top: 10px;
      position: absolute;
      display: block;
      background: #fff;
      right: 163px;
      height: 104%;
      width: 65px;
      transform: rotate(352deg);
      z-index: 1;
    }
  }
}

@media screen and (max-width: 575px) {
  .homeCard{
    min-height: 410px;
    height: 100%;
    display: flex;
    flex-direction: column;
    .mr-6{ margin: 0px !important;}
    .illustration{
      width: 100%;
      margin-right: 0px;
    }
    .text-block{
      width:100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 0;
      padding: 2px 8px;
      flex-wrap: wrap;
      .mt-3{
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      &:before{
        display: none
      }
    }

    .illustration-2{
      width: 100%;
      margin-left: 0px;
    }
    .text-block-2{
      width:100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-left: 0;
      padding: 2px 8px;
      flex-wrap: wrap;
      .mt-3{
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      &:before{
        display: none
      }

    }

    .ml-6{
      margin:0px !important;
    }
    .sm-card{
      flex-direction:column-reverse !important;
    }
  }
}
</style>
