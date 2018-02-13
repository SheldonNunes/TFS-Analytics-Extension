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

@Component({
    props: {
        initiativeId: number
    }
})


export default class FeatureBreakdown extends Vue {
    initiativeId: number;

    

}
</script>