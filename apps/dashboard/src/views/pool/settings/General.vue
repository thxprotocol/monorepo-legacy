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
                <BaseCampaignDuration class="mb-0" :settings="pool.settings" @update="onUpdateDuration" />
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Logo</strong>
                <p class="text-muted">
                    Used as logo on auth.thx.network, Discord Bot messages and your widget welcome message.
                </p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="8">
                        <b-form-group description="Only .jpg, .jpeg and .png files are allowed">
                            <b-form-file @change="onUpload($event, 'logoImgUrl')" accept=".jpg, .jpeg, .png" />
                        </b-form-group>
                    </b-col>
                    <b-col md="4">
                        <b-card body-class="py-5 text-center" class="mb-3" bg-variant="light">
                            <template v-if="logoImgUrl">
                                <img
                                    width="100%"
                                    height="auto"
                                    class="m-0"
                                    alt="Signin page logo image"
                                    :src="logoImgUrl"
                                /><br />
                                <b-link @click="onClickRemoveLogo" class="text-danger">Remove</b-link>
                            </template>
                            <span v-else class="text-gray">Preview logo URL</span>
                        </b-card>
                    </b-col>
                </b-form-row>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Background</strong>
                <p class="text-muted">Used as background on auth.thx.network when authenticating for your widget.</p>
            </b-col>
            <b-col md="8">
                <b-form-row>
                    <b-col md="8">
                        <b-form-group description="Only .jpg, .jpeg and .png files are allowed">
                            <b-form-file @change="onUpload($event, 'backgroundImgUrl')" accept=".jpg, .jpeg, .png" />
                        </b-form-group>
                    </b-col>
                    <b-col md="4">
                        <b-card body-class="py-5 text-center" class="mb-3" bg-variant="light">
                            <template v-if="backgroundImgUrl">
                                <img
                                    width="100%"
                                    height="auto"
                                    class="m-0"
                                    alt="Signin page background image"
                                    :src="backgroundImgUrl"
                                /><br />
                                <b-link @click="onClickRemoveBackground" class="text-danger">Remove</b-link>
                            </template>
                            <span v-else class="text-gray">Preview background URL</span>
                        </b-card>
                    </b-col>
                </b-form-row>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Collaborators</strong>
                <b-badge variant="dark" class="ml-2">Beta</b-badge>
                <b-badge v-if="!hasBasicAccess(pool.owner)" variant="primary" class="ml-2">Premium</b-badge>
                <p class="text-muted">Invite people from your team to collaborate on this campaign.</p>
            </b-col>
            <b-col md="8">
                <b-alert variant="danger" show v-if="errorCollaborator">{{ errorCollaborator }} </b-alert>
                <b-form-group label="E-mail" :state="isValidCollaboratorEmail" :disabled="!hasBasicAccess(pool.owner)">
                    <b-input-group>
                        <b-form-input
                            :state="isValidCollaboratorEmail"
                            v-model="emailCollaborator"
                            type="email"
                            placeholder="john@doe.com"
                        />
                        <b-input-group-append>
                            <b-button
                                :disabled="!isValidCollaboratorEmail"
                                @click="onClickCollaboratorInvite"
                                variant="dark"
                            >
                                <b-spinner small v-if="isSubmittingCollaborator" />
                                <template v-else>Send Invite</template>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
                <b-list-group v-if="pool.owner">
                    <b-list-group-item class="d-flex justify-content-between align-items-center bg-light">
                        {{ pool.owner.email }} (Owner)
                        <b-button
                            disabled
                            v-b-modal="`modalPoolTransfer${pool._id}`"
                            variant="link"
                            size="sm"
                            class="ml-3"
                        >
                            Transfer Ownership
                        </b-button>
                        <BaseModalPoolTransfer :pool="pool" />
                    </b-list-group-item>
                    <BaseListItemCollaborator
                        @error="errorCollaborator = $event"
                        :pool="pool"
                        :collaborator="collaborator"
                        :key="key"
                        v-for="(collaborator, key) of pool.collaborators"
                    />
                </b-list-group>
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
                                <strong>{{ pool.owner.email }}</strong
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
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { TBrand } from '@thxnetwork/dashboard/store/modules/brands';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { validateEmail } from '@thxnetwork/dashboard/components/modals/BaseModalRequestAccountEmailUpdate.vue';
import { hasBasicAccess } from '@thxnetwork/common';
import type { TAccount, TPoolSettings } from '@thxnetwork/types/interfaces';
import BaseListItemCollaborator from '@thxnetwork/dashboard/components/list-items/BaseListItemCollaborator.vue';
import BaseModalPoolTransfer from '@thxnetwork/dashboard/components/modals/BaseModalPoolTransfer.vue';
import BaseCampaignDuration, { parseDateTime } from '@thxnetwork/dashboard/components/cards/BaseCampaignDuration.vue';
import slugify from '@thxnetwork/dashboard/utils/slugify';
import { WIDGET_URL } from '@thxnetwork/dashboard/config/secrets';

@Component({
    components: {
        BaseListItemCollaborator,
        BaseModalPoolTransfer,
        BaseCampaignDuration,
    },
    computed: {
        ...mapGetters({
            brands: 'brands/all',
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsView extends Vue {
    isCopied = false;
    loading = true;
    error = '';
    chainInfo = chainInfo;
    profile!: TAccount;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    errorCollaborator = '';
    title = '';
    description = '';
    logoImgUrl = '';
    backgroundImgUrl = '';
    isWeeklyDigestEnabled = false;
    isArchived = false;
    isPublished = false;
    startDate: Date | null = null;
    endDate: Date | null = null;
    emailCollaborator = '';
    isSubmittingCollaborator = false;
    hasBasicAccess = hasBasicAccess;
    slugify = slugify;
    slug = '';
    isValidSlug: boolean | null = null;
    widgetUrl = WIDGET_URL;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get isValidCollaboratorEmail() {
        if (!this.emailCollaborator) return null;
        return !!validateEmail(this.emailCollaborator);
    }

    get isBrandUpdateInvalid() {
        const backgroundUrlIsValid = this.backgroundImgUrl
            ? isValidUrl(this.backgroundImgUrl)
            : this.backgroundImgUrl === '';
        const logoUrlIsValid = this.logoImgUrl ? isValidUrl(this.logoImgUrl) : this.logoImgUrl === '';
        return logoUrlIsValid && backgroundUrlIsValid;
    }

    get brand() {
        return this.brands[this.$route.params.id];
    }

    async mounted() {
        this.$store.dispatch('brands/getForPool', this.pool._id).then(async () => {
            if (!this.brand) return;
            this.backgroundImgUrl = this.brand.backgroundImgUrl;
            this.logoImgUrl = this.brand.logoImgUrl;
        });

        this.title = this.pool.settings.title || this.title;
        this.slug = this.pool.settings.slug || this.slug;
        this.description = this.pool.settings.description;
        this.isArchived = this.pool.settings.isArchived;
        this.isPublished = this.pool.settings.isPublished;
        this.isWeeklyDigestEnabled = this.pool.settings.isWeeklyDigestEnabled;

        this.loading = false;
    }

    async upload(file: File) {
        return await this.$store.dispatch('images/upload', file);
    }

    async onUpload(event: any, key: string) {
        const publicUrl = await this.upload(event.target.files[0]);
        Vue.set(this, key, publicUrl);
        await this.updateBrand();
    }

    async onClickRemoveBackground() {
        this.backgroundImgUrl = '';
        await this.updateBrand();
    }

    async onClickRemoveLogo() {
        this.logoImgUrl = '';
        await this.updateBrand();
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

    async updateBrand() {
        this.loading = true;
        await this.$store.dispatch('brands/update', {
            pool: this.pool,
            brand: { backgroundImgUrl: this.backgroundImgUrl, logoImgUrl: this.logoImgUrl },
        });
        this.loading = false;
    }

    async sendInvite(email: string) {
        this.isSubmittingCollaborator = true;
        try {
            await this.$store.dispatch('pools/inviteCollaborator', { pool: this.pool, email });
        } catch (error) {
            this.errorCollaborator = (error as any).response.data.error.message;
        } finally {
            this.isSubmittingCollaborator = false;
        }
    }

    onClickCollaboratorInvite() {
        if (!this.isValidCollaboratorEmail) return;
        this.sendInvite(this.emailCollaborator);
    }
}
</script>
