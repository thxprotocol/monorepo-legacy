<template>
    <b-card bg-variant="darker" text-variant="white" class="border-0 mt-5">
        <b-badge variant="dark" class="p-2 text-gray mb-2 mr-2" :key="key" v-for="({ tag }, key) of content.features">
            {{ tag }}
        </b-badge>
        <b-card bg-variant="dark">
            <b-embed type="iframe" aspect="16by9" :src="`${content.video}&controls=0 `" allowfullscreen />
        </b-card>
        <h3 class="h3 mt-3 font-size-l font-weight-normal">
            <router-link class="text-white" :to="content.to" :title="content.title"> {{ content.title }} </router-link>
        </h3>
        <p class="text-gray mb-0">
            {{ content.lead }}
        </p>
        <b-button variant="link-primary text-secondary pl-0" :to="content.to">
            Discover more
            <i class="fas fa-chevron-right"></i>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class Home extends Vue {
    @Prop() content!: {
        video: string;
        title: string;
        lead: string;
        logo: string;
        to: string;
        features: {
            tag: string;
        }[];
    };
}
</script>

<style scoped>
h3.mt-2.font-size-l.font-weight-normal a:hover {
    text-decoration: none;
}
</style>
