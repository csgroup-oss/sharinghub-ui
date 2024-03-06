<template>
  <LineChartGenerator
    v-if="!loading"
    :data="chartData"
    :options="chartOptions"
    :chart-data="chartData"
    :id="chartId"
    :dataset-id-key="datasetIdKey"
    :plugins="plugins"
    :css-classes="cssClasses"
    :styles="styles"
    :width="width"
    :height="height"
  />
</template>

<script>
import {defineComponent} from 'vue';
import {Line as LineChartGenerator} from 'vue-chartjs';
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import {mapState} from 'vuex';
import Utils from '@/utils';
import {PROXY_URL} from '@/_Hub/Endpoint';
import {get} from '@/_Hub/tools/https';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement
);


export default defineComponent({
  name: 'ProjectDownLoadStats',
  components: {
    LineChartGenerator
  },
  props: {
    chartId: {
      type: String,
      default: 'line-chart'
    },
    datasetIdKey: {
      type: String,
      default: 'label'
    },
    width: {
      type: Number,
      default: 100
    },
    height: {
      type: Number,
      default: 100
    },
    cssClasses: {
      default: '',
      type: String
    },
    styles: {
      type: Object,
      default: () => {
      }
    },
    plugins: {
      type: Array,
      default: () => []
    }
  },
  computed : {
    ...mapState(['data', 'url'])
  },
  // eslint-disable-next-line vue/order-in-components
  data() {
    return {
      loading : true,
      chartData: {
        labels: [
          'January',
          'February',
          'March',
          'April',
          'May',
          'June',
          'July'
        ],
        datasets: [
          {
            fill  : true,
            backgroundColor: '#188191',
            data: [40, 39, 10, 40, 39, 80, 40]
          }
        ]
      },
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        elements:{
          line:{
            tension : 0.4
          }
        }

      }
    };
  },
  async mounted() {
      const  projectId = Utils.getProjectID(this.url);
      if(projectId){
        const {fetches} = (await get(PROXY_URL.concat(`/projects/${projectId}/statistics`))).data;
        if(fetches) {
          this.loading = fetches.total === 0;
          let chart_data = fetches.days.map(el => el.count);
          let times = fetches.days.map(el => el.date);
          this.chartData.labels = times;
          this.chartData.datasets = [
            {fill: true, data: chart_data }
          ];
        }
      }
  }
});
</script>

<style scoped lang="scss">

</style>
