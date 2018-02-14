<template>
    <div>
        <select id="initiativeSelection">
            <option value="" selected disabled hidden>Select an Initiative</option>
            <option v-for="initiative in initiatives"
                v-bind:feature="initiative"
                v-bind:key="initiative.id">{{ initiative.title }}
            </option>
        </select>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import WorkItemApi from "./../api/workItemApi"

    export default Vue.extend({
        props: ['initiatives, initiativeId'],
        data() {
            return {
                initiatives: []
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