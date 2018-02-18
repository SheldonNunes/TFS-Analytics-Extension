<script lang="ts">
  import { Bar, mixins } from 'vue-chartjs';
  const { reactiveProp } = mixins;

  export default {
    extends: Bar,
    mixins: [reactiveProp],
    data() {
        return { 
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        stacked: true
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true
                        }
                    }]
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