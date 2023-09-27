<template>
    <b-container>
        <b-row class="py-5">
            <b-col :order-lg="imgAlign === 'left' ? 1 : 0" lg="6" class="pb-3 text-center">
                <b-img v-lazy="content.image" class="img-fluid" />
            </b-col>
            <b-col :order-lg="imgAlign === 'left' ? 0 : 1" lg="5" offset-lg="1" class="pt-5">
                <div class="pt-5 pt-lg-5 pt-xl-4">
                    <h2 class="h5">{{ content.tag }}</h2>
                    <p class="lead mb-4 font-size-l">{{ content.title }}</p>
                </div>
                <p class="lead" v-html="content.description" />
                <ul class="list-unstyled" v-if="content.list.length">
                    <li class="pb-2 lead" :key="key" v-for="(item, key) of content.list">
                        <i class="fas fa-check text-success mr-2"></i>
                        <span class="">{{ item }}</span>
                    </li>
                </ul>
                <b-button variant="primary" class="rounded-pill" :href="dashboardUrl">
                    Create {{ content.tag }}
                    <i class="fas fa-chevron-right ml-2" />
                </b-button>
                <b-button variant="link" :href="content.docsUrl" target="_blank">
                    Read more
                    <i class="fas fa-chevron-right ml-2" />
                </b-button>
            </b-col>
        </b-row>
    </b-container>
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';
import { DASHBOARD_URL } from '../config/secrets';

@Component({})
export default class BaseRowContent extends Vue {
    dashboardUrl = DASHBOARD_URL;

    @Prop() content!: {
        tag: string;
        image: string;
        title: string;
        description: string;
        list: string[];
    };

    @Prop() imgAlign!: string;
}
</script>
