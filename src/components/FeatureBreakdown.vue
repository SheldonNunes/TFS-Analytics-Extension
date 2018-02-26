<template>
    <div class="dataRowContainer dataRowContainer--dynamicHeight">
        <div class="container container--halfWidth ">
            <div>
                <p class="featureName">{{ node.data.fields["System.Title"] }}</p>
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

    export default Vue.extend({
        props: ['node'],
        components: {
            WorkItemBulletPoint
        },
        computed: {
            title: function() {
                return this.node.data.fields["System.Title"]
            }
        }
    });
</script>

<style scoped>
    .featureName {
        font-size: 2em;
        line-height: 0;
        text-decoration: underline;
    }
    .workItem {
        margin-left: 50px;
    }
    
    .task {
        margin-left: 80px;
    }
</style>