<template>
    <div>
        <ol>
            <li v-for="feature in features"
                v-bind:feature="feature"
                v-bind:key="feature.title">
            </li>
        </ol>
    </div>
</template>
<script lang="ts">
    import Vue from 'vue'
    import Component from 'vue-class-component'

    @Component({
        props: [
            initiativeId: number
        ]
    })

    export default Vue.extend({
        props: ['initiativeId'],
        data() {
            return {
                initiatives: []
            }
        },
        : number;



    });
</script>