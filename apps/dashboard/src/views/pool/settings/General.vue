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
                <strong>Title</strong>
                <div class="text-muted">Your campaign title will be used to generate your landing page.</div>
            </b-col>
            <b-col md="8">
                <b-form-group description="Minimum of 3 and maximum of 50 characters.">
                    <b-form-input
                        @change="onChangeSettings"
                        v-model="title"
                        placeholder="Short campaign title..."
                        min="3"
                        max="50"
                        :state="title ? (title.length < 50 ? null : false) : null"
                    />
                </b-form-group>
                <b-form-group
                    description="Minimum of 3 and maximum of 25 characters."
                    class="mb-0"
                    :state="isValidSlug"
                    invalid-feedback="This slug is invalid."
                >
                    <b-input-group size="sm" :prepend="`${widgetUrl}/c/`">
                        <b-form-input
                            size="sm"
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
                                size="sm"
                                class="ml-0"
                            >
                                <i class="fas ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                            </b-button>
                        </template>
                    </b-input-group>
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>About</strong>
                <div class="text-muted">This summary is used to explain your campaign to users.</div>
            </b-col>
            <b-col md="8">
                <b-form-group description="Maximum of 255 characters." class="mb-0">
                    <b-textarea
                        v-model="description"
                        @change="onChangeSettings"
                        :state="description ? description.length < 255 : null"
                        placeholder="Some words about your campaign.."
                    ></b-textarea>
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Duration</strong>
                <div class="text-muted">Configure start and end dates for this campaign.</div>
            </b-col>
            <b-col md="8">
                <BaseDateDuration class="mb-0" :settings="pool.settings" @update="onUpdateDuration" />
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Wallet</strong>
                <div class="text-muted">Your campaign wallet is used for fee payments and reward distribution.</div>
            </b-col>
            <b-col md="8">
                <b-form-group
                    label="Safe Multisig Address"
                    description="Your assets are stored in Safe's battle-tested multisigs."
                >
                    <b-input-group>
                        <b-form-input disabled :value="pool.safe && pool.safe.address" />
                        <template #append>
                            <b-button
                                :disabled="!slug.length"
                                variant="dark"
                                v-clipboard:copy="pool.safe && pool.safe.address"
                                v-clipboard:success="() => (isCopied = true)"
                                size="sm"
                                class="ml-0 px-4"
                            >
                                <i class="fas ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                            </b-button>
                        </template>
                    </b-input-group>
                    <template #description>
                        Your assets are stored in
                        <b-link
                            :href="`https://app.safe.global/apps/open?safe=matic:${pool.safe && pool.safe.address}`"
                            target="_blank"
                        >
                            Safe's battle-tested multisigs
                        </b-link>
                    </template>
                </b-form-group>
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
                                List your campaign on
                                <b-link href="https://campaign.thx.network" target="_blank">
                                    campaign.thx.network
                                </b-link>
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
                    <b-form-group>
                        <b-form-checkbox @change="onChangeSettings" v-model="isArchived" class="mr-3">
                            <strong>Archived</strong><br />
                            <span class="text-muted"> Hide this pool in your overview of pools. </span>
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
            :subject="pool._id"
        />
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { hasBasicAccess } from '@thxnetwork/common';
import type { TAccount, TPoolSettings } from '@thxnetwork/types/interfaces';
import BaseListItemCollaborator from '@thxnetwork/dashboard/components/list-items/BaseListItemCollaborator.vue';
import BaseModalPoolTransfer from '@thxnetwork/dashboard/components/modals/BaseModalPoolTransfer.vue';
import BaseDateDuration, { parseDateTime } from '@thxnetwork/dashboard/components/form-group/BaseDateDuration.vue';
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';
import slugify from '@thxnetwork/dashboard/utils/slugify';
import { WIDGET_URL } from '@thxnetwork/dashboard/config/secrets';

@Component({
    components: {
        BaseListItemCollaborator,
        BaseModalPoolTransfer,
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
    isWeeklyDigestEnabled = false;
    isArchived = false;
    isPublished = false;
    startDate: Date | null = null;
    endDate: Date | null = null;
    hasBasicAccess = hasBasicAccess;
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
        this.isArchived = this.pool.settings.isArchived;
        this.isPublished = this.pool.settings.isPublished;
        this.isWeeklyDigestEnabled = this.pool.settings.isWeeklyDigestEnabled;
    }

    onUpdateDuration({ startDate, startTime, endDate, endTime }) {
        this.onChangeSettings({
            startDate: parseDateTime(startDate, startTime),
            endDate: parseDateTime(endDate, endTime),
        } as any);
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
                startDate: this.startDate,
                endDate: this.endDate,
                isPublished: this.isPublished,
                isArchived: this.isArchived,
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
