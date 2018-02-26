<template>
    <div class="work-item-container">
        <img class="hex-bullet" v-if="isCompleted" :src="'images/hex-tick.svg'"/>
        <img class="hex-bullet" v-else :src="'images/hex-cross.svg'"/>
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
            }
        }
    });
</script>

<style scoped>
    .work-item-container {
        display: flex;
    }

    .hex-bullet {
        width: 30px;
        height: 30px;
    }

    .workItemName {
        font-size: 1.2em;
        line-height: 0.5;
        text-indent: 10px;
    }
</style>