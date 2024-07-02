<template>
    <div>
        <b-form-row v-if="error">
            <b-col md="4"></b-col>
            <b-col md="8">
                <b-alert variant="danger" show>
                    {{ error }}
                </b-alert>
            </b-col>
        </b-form-row>
        <b-form-row>
            <b-col md="4">
                <strong>Info</strong>
                <div class="text-muted">Provide information to your audience about your campaign.</div>
            </b-col>
            <b-col md="8">
                <BaseFormGroup
                    label="Title"
                    tooltip="This title is used to identify your campaign in the list of public campaigns and in various notifications."
                    description="Minimum of 3 and maximum of 50 characters."
                >
                    <b-form-input
                        @change="onChangeSettings"
                        v-model="title"
                        placeholder="Short campaign title..."
                        min="3"
                        max="50"
                        :state="title ? (title.length < 50 ? null : false) : null"
                    />
                </BaseFormGroup>
                <BaseFormGroup
                    label="Description"
                    tooltip="This description is shown on your campaign's about page and in the THX Bot"
                    description="Maximum of 255 characters."
                >
                    <b-textarea
                        v-model="description"
                        @change="onChangeSettings"
                        :state="description ? description.length < 255 : null"
                        placeholder="Some words about your campaign.."
                    />
                </BaseFormGroup>
                <BaseFormGroup
                    label="Campaign URL"
                    tooltip="For quests campaigns that do not use the campaign widget."
                    description="Minimum of 3 and maximum of 25 characters."
                    invalid-feedback="This slug is invalid."
                    :state="isValidSlug"
                >
                    <b-input-group :prepend="`${widgetUrl}/c/`">
                        <b-form-input
                            :value="slug"
                            :placeholder="slugify(title)"
                            :state="isValidSlug"
                            min="3"
                            max="25"
                            @input="slug = slugify($event)"
                            @change="onChangeSlug"
                        />
                        <template #append>
                            <b-button
                                :disabled="!slug.length"
                                variant="dark"
                                v-clipboard:copy="`${widgetUrl}/c/${slug}`"
                                v-clipboard:success="() => (isCopied = true)"
                                class="ml-0"
                            >
                                <i class="fas ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                            </b-button>
                        </template>
                    </b-input-group>
                </BaseFormGroup>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Leaderboard</strong>
                <div class="text-muted">
                    Leaderboard scores are the sumb of points earned with quests over a given amount of weeks.
                </div>
            </b-col>
            <b-col md="8">
                <BaseFormGroup
                    label="Duration (weeks)"
                    description="Minimum of 1 and maximum of 52 weeks."
                    tooltip="The public scores will be calculated based this amount of weeks since the current date. Shorter durations will show more recent scores. Longer durations will show more stable scores."
                >
                    <b-form-input
                        @change="onChangeSettings"
                        v-model="leaderboardInWeeks"
                        min="1"
                        max="52"
                        type="number"
                    />
                    <template #description>
                        View the
                        <b-link :to="`${widgetUrl}/c/${pool.settings.slug}/ranking`">public leaderboard</b-link> for
                        your campaign or learn more about your top participants in
                        <b-link :to="`/pool/${pool._id}/dashboard`">campaign analytics</b-link>.
                    </template>
                </BaseFormGroup>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Wallet</strong>
                <div class="text-muted">This wallet is used for reward distribution and fee payments.</div>
            </b-col>
            <b-col md="8">
                <BaseFormGroup
                    label="Safe Wallet Address"
                    tooltip="Your assets are stored in Safe's battle-tested multisigs."
                >
                    <b-input-group>
                        <b-form-input disabled :value="pool.safe && pool.safeAddress" />
                        <template #append>
                            <b-button
                                :disabled="!slug.length"
                                variant="dark"
                                v-clipboard:copy="pool.safe && pool.safeAddress"
                                v-clipboard:success="() => (isCopied = true)"
                                class="ml-0"
                            >
                                <i class="fas ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                            </b-button>
                        </template>
                    </b-input-group>
                    <template #description>
                        Your assets are stored in
                        <b-link
                            :href="`https://app.safe.global/transactions/history?safe=${pool.safe && pool.safeAddress}`"
                            target="_blank"
                        >
                            Safe's battle-tested multisigs
                        </b-link>
                    </template>
                </BaseFormGroup>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4"> </b-col>
            <b-col md="8">
                <b-form-group>
                    <b-form-group>
                        <b-form-checkbox @change="onChangeSettings" v-model="isPublished" class="mr-3">
                            <strong>Public Campaign</strong><br />
                            <span class="text-muted">
                                List your campaign in
                                <b-link :href="widgetUrl" target="_blank"> Campaign Discovery </b-link>
                                <i
                                    v-b-tooltip
                                    title="Campaigns must contain at least 1 quest and 1 reward."
                                    class="fas fa-question-circle text-gray"
                                />
                            </span>
                        </b-form-checkbox>
                    </b-form-group>
                    <b-form-group>
                        <b-form-checkbox @change="onChangeSettings" v-model="isWeeklyDigestEnabled" class="mr-3">
                            <strong>Weekly Digest</strong><br />
                            <span class="text-muted">
                                On Monday we will share campaign performance metrics with
                                <strong v-if="pool.owner">{{ pool.owner.email }}</strong
                                >.
                            </span>
                        </b-form-checkbox>
                    </b-form-group>
                </b-form-group>
            </b-col>
        </b-form-row>

        <b-form-row>
            <b-col offset-xl="4">
                <b-card class="border-danger" body-class="d-flex justify-content-between">
                    <div>
                        <i class="fas fa-exclamation-triangle mr-3" />
                        <strong>Danger Zone!</strong>
                    </div>
                    <b-link class="text-danger" v-b-modal="`modalDelete-${pool._id}`">Remove this campaign</b-link>
                </b-card>
            </b-col>
        </b-form-row>
        <BaseModalDelete
            @submit="remove(pool._id)"
            :id="`modalDelete-${pool._id}`"
            :error="error"
            :subject="pool.settings.title"
        />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import BaseListItemCollaborator from '@thxnetwork/dashboard/components/list-items/BaseListItemCollaborator.vue';
import BaseDateDuration from '@thxnetwork/dashboard/components/form-group/BaseDateDuration.vue';
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';
import slugify from '@thxnetwork/dashboard/utils/slugify';
import { WIDGET_URL } from '@thxnetwork/dashboard/config/secrets';

@Component({
    components: {
        BaseListItemCollaborator,
        BaseDateDuration,
        BaseModalDelete,
    },
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsView extends Vue {
    isCopied = false;
    error = '';
    chainInfo = chainInfo;
    profile!: TAccount;
    pools!: IPools;
    title = '';
    description = '';
    leaderboardInWeeks = 4;
    isWeeklyDigestEnabled = false;
    isPublished = false;
    startDate: Date | null = null;
    endDate: Date | null = null;
    slugify = slugify;
    slug = '';
    isValidSlug: boolean | null = null;
    widgetUrl = WIDGET_URL;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async mounted() {
        this.title = this.pool.settings.title || this.title;
        this.slug = this.pool.settings.slug || this.slug;
        this.description = this.pool.settings.description;
        this.isPublished = this.pool.settings.isPublished;
        this.isWeeklyDigestEnabled = this.pool.settings.isWeeklyDigestEnabled;
        this.leaderboardInWeeks = this.pool.settings.leaderboardInWeeks;
    }

    async onChangeSlug(slug: string) {
        try {
            if (!slug.length) {
                this.slug = slug = this.pool._id;
            }
            if (slug.length < 3) throw new Error('Slug too short');

            await this.$store.dispatch('pools/update', {
                pool: this.pool,
                data: { settings: { slug: slugify(slug) } },
            });
            this.isValidSlug = null;
        } catch (error) {
            this.isValidSlug = false;
        }
    }

    async onChangeSettings(setting?: Partial<TPoolSettings>) {
        const settings = Object.assign(
            {
                title: this.title,
                slug: this.slug,
                description: this.description,
                leaderboardInWeeks: Number(this.leaderboardInWeeks),
                isPublished: this.isPublished,
                isWeeklyDigestEnabled: this.isWeeklyDigestEnabled,
            },
            setting,
        );

        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { settings },
        });

        this.error = '';
    }

    async remove(_id: string) {
        this.$store.dispatch('pools/remove', { _id });
        this.$router.push({ name: 'home' });
    }
}
</script>
