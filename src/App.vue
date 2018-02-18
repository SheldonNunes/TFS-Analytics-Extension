<template>
    <div id="app">
        <div class="page">
            <div class="row">
                <div class="dataRowContainer">
                    <div class="container container--seventypercentwidth">
                        <div class="initiative-summary">
                            <initiative-selector v-on:initiativeChanged="initiativeChanged"/>
                            <initiative-summary v-bind:summary="summary.itemTypes"/>
                        </div>
                    </div>
                    <div class="container container--thirtypercentwidth">
                        <summary-chart v-bind:statusSummary="summary.itemStatuses"/></summary-chart>
                    </div>
                </div>

                <div class="dataRowContainer">
                        <div class="container container--fullWidth">
                            <div class="chart">
                                <canvas id="featureBreakdownChart"></canvas>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue'
    //import FeatureBreakdown from "./components/FeatureBreakdown.vue"
    import InitiativeSelector from "./components/InitiativeSelector.vue"
    import InitiativeSummary from "./components/InitiativeSummary.vue"
    import SummaryChart from "./components/SummaryChart.vue"
    import { workItemApi } from "./api/workItemApi"
    import { summaryService } from "./services/summaryService"

    export default {
        name: 'app',
        data() {
            return {
                features: [],
                summary: {
                    itemTypes: {},
                    itemStatuses: {}
                }
            }
        },
        components: {
            // FeatureBreakdown,
            InitiativeSelector,
            InitiativeSummary,
            SummaryChart
        },
        methods: {
            initiativeChanged: function(id) {
                workItemApi.getWorkItems(id).then((function(tree) {
                    let summary = summaryService.getSummary(tree);
                    this.summary.itemTypes = summary.itemTypes;
                    this.summary.itemStatuses = summary.itemStatuses;
                }).bind(this));
            }
        }
    }
</script>