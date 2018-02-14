<template>
    <div>
        <ul class="summaryPoints">
            <li>Total Features: <span class="summaryValues" id="totalFeatures"/>{{summary.featureCount}}</li>
            <li>Total Work Items: <span class="summaryValues" id="totalWorkItems"/>{{summary.workItemCount}}</li>
            <li>Total Bugs: <span class="summaryValues" id="totalBugs"/>{{summary.bugCount}}</li>                            
            <li>Total Tasks: <span class="summaryValues" id="totalTasks"/>{{summary.taskCount}}</li>
        </ul>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import WorkItemApi from "./../api/workItemApi"

    export default Vue.extend({
        props: ['summary'],
        data() {
            return {
                summary: []
            }
        },
        methods: {
            retrieveEpicCategoryItems : function() {
                let workItemApi:WorkItemApi = new WorkItemApi();
                workItemApi.getEpicCategoryItems().then((function(items) {
                    this.initiatives = items;
                }).bind(this))
            }   
        },
        mounted() {
            this.retrieveEpicCategoryItems();
        }

    });
</script>