<template>
    <div class="chart">
        <p id="summaryCompletePercentageIndicator">{{ percentageComplete }}</p>
        <doughnut-chart id="summaryChart" v-bind:chartData="chartData"></doughnut-chart>
    </div>
</template>

<script lang="ts">
    import DoughnutChart from './DoughnutChart'

    const CompleteColour = "rgba(0, 122, 204, 1.0)";
    const NotCompletedColour = "rgba(109, 109, 109, 0.25)";

    export default {
        components: {
            DoughnutChart
        },
        props: ['statusSummary'],
        computed: {
            completed: function() {
                return this.statusSummary.completed;
            },
            incompleted: function() {
                return this.statusSummary.incompleted;
            },
            percentageComplete: function() {
                return Math.round((this.completed / (this.incompleted  + this.completed)) * 100) + "%";
            },
            chartData: function() {
                let chartDataSet: Chart.ChartDataSets = {
                    backgroundColor: [CompleteColour, NotCompletedColour],
                    data: [this.completed, this.incompleted],
                    label: "Progress",
                };
                let chartData: Chart.ChartData = {
                    datasets: [chartDataSet],            
                    labels: ["Completed", "Not Completed"],
                };
                return chartData;
            }
        }
    };
</script>

<style scoped>
    #summaryChart {
        height: 100%;
    }
    
    #summaryCompletePercentageIndicator {
        position: absolute;
        margin: 0;
        margin: none;
        padding: none;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 3em;
    }
</style>