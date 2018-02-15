<template>
    <div>
        <select v-model="selected" v-on:change="onChange" id="initiativeSelection">
            <option value="" selected disabled hidden>Select an Initiative</option>
            <option v-for="initiative in initiatives"
                v-bind:feature="initiative"
                v-bind:key="initiative.id"
                v-bind:value="initiative.id">{{ initiative.title }}
            </option>
        </select>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import { workItemApi } from "./../api/workItemApi"

    export default Vue.extend({
        props: ['initiatives, initiativeId'],
        data() {
            return {
                initiatives: [],
                selected: ""
            }
        },
        methods: {
            retrieveEpicCategoryItems: function() {
                workItemApi.getEpicCategoryItems().then((function(items) {
                    this.initiatives = items;
                }).bind(this))
            },
            onChange: function() {
                this.$emit('initiativeChanged', this.selected)
            }
        },
        mounted() {
            this.retrieveEpicCategoryItems();
        }

    });
</script>