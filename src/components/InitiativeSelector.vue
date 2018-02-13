<template>
    <div>
        <select id="initiativeSelection">
            <option value="" selected disabled hidden>Select an Initiative</option>
            <option v-for="initiative in initaitives"
                v-bind:feature="initiative"
                v-bind:key="initiative.title"
        </select>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import WorkItemApi from "./api/workItemApi"

    @Component
    export default class InitiativeSelector extends Vue {
        initiatives: [];
        private workItemApi:WorkItemApi
        constructor() {
            this.workItemApi = new WorkItemApi();
        }

        mounted () {
            this.retrieveEpicCategoryItems();
            this.greet()
        }

        retrieveEpicCategoryItems() {
            workItemApi.getEpicCategoryItems().then(function(items) {
                initiatives = items;
            });
        }
    }
</script>