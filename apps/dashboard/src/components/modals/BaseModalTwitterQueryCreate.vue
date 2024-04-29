<template>
    <base-modal size="xl" hide-footer title="Twitter Query" :id="id" @show="onShow" :error="error">
        <template #modal-body>
            <b-row>
                <b-col>
                    <BaseCardTwitterQueryOperators
                        :from="from"
                        @from="from = $event"
                        :to="to"
                        @to="to = $event"
                        :text="text"
                        @text="text = $event"
                        :url="url"
                        @url="url = $event"
                        :hashtags="hashtags"
                        @hashtags="hashtags = $event"
                        :mentions="mentions"
                        @mentions="mentions = $event"
                        :media="media"
                        @media="media = $event"
                    />
                </b-col>
                <b-col>
                    <BaseCardTwitterPostPreviews :operators="operators" />
                </b-col>
            </b-row>
            <b-button
                :disabled="isLoading"
                class="rounded-pill"
                type="submit"
                @click="onClickCreate"
                variant="primary"
                block
            >
                Create Rule
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TwitterQuery } from '@thxnetwork/common/twitter';
import BaseModal from './BaseModal.vue';
import BaseCardTwitterPostPreviews from '@thxnetwork/dashboard/components/cards/BaseCardTwitterPostPreviews.vue';
import BaseCardTwitterQueryOperators from '@thxnetwork/dashboard/components/cards/BaseCardTwitterQueryOperators.vue';

@Component({
    components: {
        BaseModal,
        BaseCardTwitterPostPreviews,
        BaseCardTwitterQueryOperators,
    },
})
export default class BaseModalTwitterQueryCreate extends Vue {
    isLoading = false;
    isCopied = false;
    error = '';
    from = [''];
    to = [''];
    text = [''];
    url = [''];
    hashtags = [''];
    mentions = [''];
    media: string | null = null;

    @Prop() id!: string;
    @Prop() query!: TTwitterQuery;
    @Prop() pool!: TPool;

    onShow() {
        if (!this.query) return;

        this.from = this.query.operators.from ? this.query.operators.from : this.from;
        this.to = this.query.operators.to ? this.query.operators.to : this.to;
        this.text = this.query.operators.text ? this.query.operators.text : this.text;
        this.url = this.query.operators.url ? this.query.operators.url : this.url;
        this.hashtags = this.query.operators.hashtags ? this.query.operators.hashtags : this.hashtags;
        this.mentions = this.query.operators.mentions ? this.query.operators.mentions : this.mentions;
        this.media = this.query.operators.media ? this.query.operators.media : this.media;
    }

    get operators() {
        return {
            from: this.from,
            to: this.to,
            text: this.text,
            url: this.url,
            hashtags: this.hashtags,
            mentions: this.mentions,
            media: this.media,
        };
    }

    async onClickCreate() {
        this.isLoading = true;
        try {
            const operators = TwitterQuery.stringify(this.operators);
            await this.$store.dispatch('pools/createTwitterQuery', {
                pool: this.pool,
                data: { operators },
            });
            this.$store.dispatch('pools/listTwitterQueries', { pool: this.pool });
            this.$bvModal.hide(this.id);
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
