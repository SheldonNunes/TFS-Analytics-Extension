<template>
    <div id="app">
        <div class="page">
            <div class="row">
                <div class="dataRowContainer">
                    <div class="container container--seventypercentwidth">
                        <div class="initiative-summary">
                            <initiative-selector v-on:initiativeChanged="initiativeChanged"/>
                            <initiative-summary v-bind:summary="summary"/>
                        </div>
                    </div>
                    <div class="container container--thirtypercentwidth">
                        <div class="chart">
                            <p id="summaryCompletePercentageIndicator"></p>
                            <canvas id="summaryCompleteChart"></canvas>
                        </div>
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
    import { workItemApi } from "./api/workItemApi"
    import { WorkItemType } from "./workItemClassifier"
    import { workItemTypeCounter } from "./workItemTypeCounter"

    export default {
        name: 'app',
        data() {
            return {
                features: [],
                summary: {
                    featureCount: 0,
                    workItemCount: 0,
                    bugCount: 0,
                    taskCount: 0
                }
            }
        },
        components: {
            // FeatureBreakdown,
            InitiativeSelector,
            InitiativeSummary
        },
        methods: {
            initiativeChanged: function(id) {
                workItemApi.getWorkItems(id).then((function(tree) {
                    this.summary = workItemTypeCounter.getWorkItemCountFromTree(tree);
                }).bind(this));
            }
        }
    }
</script>