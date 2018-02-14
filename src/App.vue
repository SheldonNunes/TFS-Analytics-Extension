<template>
    <div id="app">
        <div class="page">
            <div class="row">
                <div class="dataRowContainer">
                    <div class="container container--seventypercentwidth">
                        <div class="initiative-summary">
                            <initiative-selector></Initiative-selector>
                            <ul class="summaryPoints">
                                <li>Total Features: <span class="summaryValues" id="totalFeatures"/></li>
                                <li>Total Work Items: <span class="summaryValues" id="totalWorkItems"/></li>
                                <li>Total Bugs: <span class="summaryValues" id="totalBugs"/></li>                            
                                <li>Total Tasks: <span class="summaryValues" id="totalTasks"/></li>
                            </ul>
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

    export default {
        name: 'app',
        components: {
            // FeatureBreakdown,
            InitiativeSelector
        }
    }
</script>