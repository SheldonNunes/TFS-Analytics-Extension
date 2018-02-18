<script lang="ts">
  import { Doughnut, mixins } from 'vue-chartjs';
  const { reactiveProp } = mixins;

  export default {
    extends: Doughnut,
    mixins: [reactiveProp],
    data() {
        return { 
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: false
                }
            }
        }
    }, 
    mounted() {
      // this.chartData is created in the mixin
      this.renderChart(this.chartData, this.options);
    },
  };
</script>