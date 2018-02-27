<template>
    <div v-bind:class="workItemBullet">
        <p class="workItemName">{{ workItem.data.fields["System.Title"] }}</p>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'
    import { WorkItemState, workItemStateHelper } from './../helpers/workItemStateHelper'


    export default Vue.extend({
        props: ['workItem'],
        computed: {
            isCompleted: function() {
                console.log(this.workItem);
                if(workItemStateHelper.getWorkItemState(this.workItem.data) === WorkItemState.Completed) {
                    return true;
                }
                return false;
            },
            workItemBullet: function() {
                return {
                    'work-item-container': true,
                    'workItemName--cross': !this.isCompleted,
                    'workItemName--tick' : this.isCompleted
                }
            }
        }
    });
</script>

<style scoped>
    .work-item-container {
        margin-top: 12px;
        display: flex;
    }

    .workItemName--cross:before {
        display:inline-block;
        content:"";        
        text-indent: -9999px;
        width:25px;
        height:25px;
        background: url('../../static/images/cross-rounded.svg');
        background-size: 25px 25px;
    
    }
        
    .workItemName--tick:before {
        display:inline-block;
        text-indent: -9999px;
        content:"";
        width:25px;
        height:25px;
        background: url('../../static/images/tick-rounded.svg');
        background-size: 25px 25px;        
    }

    .workItemName {
        font-size: 1.4em;
        text-indent: 10px;
        margin: 0;
    }
</style>