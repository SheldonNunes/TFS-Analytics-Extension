<template>
    <div>
        <ul class="summaryPoints">
            <li>Total Features: <span class="summaryValues summaryValues--purple">{{ summary.featureCount }}</span></li>
            <li>Total Work Items: <span class="summaryValues summaryValues--blue">{{summary.workItemCount}}</span></li>
            <li>Total Bugs: <span class="summaryValues summaryValues--red">{{summary.bugCount}}</span></li>                            
            <li>Total Tasks: <span class="summaryValues summaryValues--yellow">{{summary.taskCount}}</span></li>
        </ul>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'

    export default Vue.extend({
        props: ['summary']
    });
</script>

<style scoped>
    .summaryPoints {
        font-size: 2.0em;
        line-height: 2.0;
    }

    .summaryValues {
        font-weight: bold;
        font-size: 1.2em;
    }

    .summaryValues--purple { 
        color: #773b93;
    }

    .summaryValues--blue {
        color: #009ccc;
    }

    .summaryValues--yellow {
        color: #f2cb1d
    }

    .summaryValues--red {
        color: #cc293d;
    }
</style>