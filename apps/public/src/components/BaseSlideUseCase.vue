<template>
    <b-card class="border-0 mt-5">
        <!-- <div class="mb-2">
            <b-badge
                variant="gray"
                class="p-2 text-white mr-2 mb-2"
                :key="key"
                v-for="({ tag }, key) of content.features"
            >
                {{ tag }}
            </b-badge>
        </div> -->
        <b-card bg-variant="light" v-if="content.video">
            <b-embed type="iframe" aspect="16by9" :src="`${content.video}&controls=0 `" allowfullscreen />
        </b-card>
        <h3 class="h3 mt-3 font-size-l font-weight-normal">
            <router-link class="text-dark" :to="content.to" :title="content.title"> {{ content.title }} </router-link>
        </h3>
        <p class="text-gray mb-0">
            {{ content.lead }}
        </p>
        <b-button variant="link-primary" class="text-primary pl-0" :to="content.to">
            Discover more
            <i class="fas fa-chevron-right"></i>
        </b-button>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseSlideUseCase extends Vue {
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
h3.font-size-l.font-weight-normal a:hover {
    text-decoration: none;
}
</style>
