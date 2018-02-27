<template>
    <div id="app">
        <div class="page">
            <initiative-selector v-on:initiativeChanged="initiativeChanged"/>
            <div class="row" v-if="initiativeTitle !== ''">
                <div class="dataRowContainer">
                    <div class="container container--seventypercentwidth">
                        <div class="initiative-summary">
                            <h2>{{ initiativeTitle }}</h2>
                            <initiative-summary v-bind:summary="summary.itemTypes"/>
                        </div>
                    </div>
                    <div class="container container--thirtypercentwidth">
                        <summary-chart v-bind:statusSummary="summary.itemStatuses"/></summary-chart>
                    </div>
                </div>

                <div class="dataRowContainer">
                    <div class="container container--fullWidth">
                        <feature-chart v-bind:features="features"></feature-chart>
                    </div>
                </div>
                
                <feature-breakdown 
                v-for="node in features" 
                v-bind:key="node.data.id"
                v-bind:node="node">
                </feature-breakdown>
            </div>
        </div>
    </div>
</template>


<script lang="ts">
    import Vue from 'vue'
    import FeatureBreakdown from "./components/FeatureBreakdown.vue"
    import InitiativeSelector from "./components/InitiativeSelector.vue"
    import InitiativeSummary from "./components/InitiativeSummary.vue"
    import FeatureChart from "./components/FeatureChart.vue"
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
                },
                initiativeTitle: ""
            }
        },
        components: {
            InitiativeSelector,
            InitiativeSummary,
            SummaryChart,
            FeatureBreakdown,
            FeatureChart
        },
        methods: {
            initiativeChanged: function(id) {
                workItemApi.getWorkItems(id).then((function(tree) {
                    let summary = summaryService.getSummary(tree);
                    this.summary.itemTypes = summary.itemTypes;
                    this.summary.itemStatuses = summary.itemStatuses;
                    this.initiativeTitle = tree._root.data.fields["System.Title"]
                    this.features = tree._root.children;
                    console.log(this.features);
                }).bind(this));
            }
        }
    }
</script>