<template>
    <div class="chart">
        <stacked-bar-chart id="featureChart" v-bind:chartData="chartData"></stacked-bar-chart>
    </div>
</template>

<script lang="ts">
    import StackedBarChart from './StackedBarChart'
    import { summaryService } from './../services/summaryService'
    import { WorkItemState } from './../helpers/workItemStateHelper'

    const CompleteColour = "rgba(0, 122, 204, 1.0)";
    const NotCompletedColour = "rgba(109, 109, 109, 0.25)";

    export default {
        components: {
            StackedBarChart
        },
        props: ['features'],
        computed: {
            statuses: function() {
                if(this.features) {
                    return summaryService.getFeatureSummary(this.features);
                }
            },
            completed: function() {
                    return this.statuses.map(x => x.children.reduce((acc, val) => { 
                        let state = val.state;
                        if(state === WorkItemState.Completed) {
                            return acc += 1;
                        }
                        return acc;
                    }, 0))
            },
            incompleted: function() {
                    return this.statuses.map(x => x.children.reduce((acc, val) => { 
                        let state = val.state;
                        if(state === WorkItemState.NotCompleted) {
                            return acc += 1;
                        }
                        return acc;
                    }, 0))
            },
            chartData: function() {
                if(this.features) {
                    let completedDataSet: Chart.ChartDataSets = {
                        backgroundColor: CompleteColour,
                        data: this.completed,
                        label: "Completed",
                    };

                    let incompletedDataSet: Chart.ChartDataSets = {
                        backgroundColor: NotCompletedColour,
                        data: this.incompleted,
                        label: "Not Completed",
                    };

                    let chartData: Chart.ChartData = {
                        datasets: [completedDataSet, incompletedDataSet],         
                        labels: this.statuses.map(a => a.title),
                    };
                    return chartData;
                }
            }
        }
    };
</script>

<style scoped>
    #featureChart {
        height: 100%;
    }
</style>