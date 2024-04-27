<template>
    <div>
        <b-card variant="light" class="mb-3">
            <b-form-group label-class="d-flex align-items-center">
                <template #label>
                    Search query
                    <b-button size="sm" variant="primary" class="ml-auto rounded-pill" @click="onClickSearch">
                        <b-spinner small v-if="isLoading" />
                        <template v-else> Preview results</template>
                    </b-button>
                </template>
                <code>{{ query }}</code>
            </b-form-group>
        </b-card>
        <BaseCardTwitterPost :post="post" :key="key" v-for="(post, key) of posts" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';
import BaseCardTwitterPost from '@thxnetwork/dashboard/components/cards/BaseCardTwitterPost.vue';
import { TwitterQuery } from '@thxnetwork/common/twitter';

@Component({
    components: {
        BaseCardTwitterPost,
    },
})
export default class BaseCardTwitterPostPreviews extends Vue {
    format = format;
    isLoading = false;
    posts: TTwitterPostWithUserAndMedia[] = [];

    @Prop() operators!: TTwitterOperators;

    get query() {
        const operators = TwitterQuery.stringify(this.operators);
        const operatorsObj = TwitterQuery.parse(operators);
        return TwitterQuery.create(operatorsObj);
    }

    async onClickSearch() {
        this.isLoading = true;
        try {
            const operators = TwitterQuery.stringify(this.operators);
            const posts = await this.$store.dispatch('account/searchTweets', {
                data: { operators },
            });
            this.posts = posts;
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
