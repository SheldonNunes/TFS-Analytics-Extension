<template>
    <div class="dataRowContainer dataRowContainer--dynamicHeight">
        <div class="container container--relative container--fullWidth">
            <div class="progressBar" :style="{ width: progressStyle.width }"></div>
            <div>
                <p class="featureName">Feature: {{ node.data.fields["System.Title"] }}</p>
                <div v-for="workItem in node.children" v-bind:key="workItem.data.id">
                    <work-item-bullet-point class="workItem" v-bind:workItem="workItem"/>
                    <div v-for="task in workItem.children" v-bind:key="task.data.id">
                        <work-item-bullet-point class="task" v-bind:workItem="task"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'
    import WorkItemBulletPoint from './WorkItemBulletPoint.vue'
    import { summaryService } from './../services/summaryService'   
    import { WorkItemState } from './../helpers/workItemStateHelper'

    export default Vue.extend({
        props: ['node'],
        components: {
            WorkItemBulletPoint
        },
        computed: {
            title: function() {
                return this.node.data.fields["System.Title"]
            },
            progressStyle: function() {
                return {
                    width: '100%'
                }
            }
        }
    });
</script>

<style scoped>
    .progressBar {
        position:absolute;
        left: 0;
        top: 0;
        height: 3px;
        background-color: #009ccc;
    }

    .container--relative {
        position: relative;
    }

    .featureName {
        font-size: 2em;
        line-height: 0;
    }

    .workItem {
        margin-left: 50px;
    }
    
    .task {
        margin-left: 80px;
    }
</style>