<template>
    <div>
        <b-form-row v-if="error">
            <b-col md="4"></b-col>
            <b-col md="4">
                <b-alert variant="danger" show>
                    {{ error }}
                </b-alert>
            </b-col>
        </b-form-row>
        <b-form-row>
            <b-col md="4">
                <strong>Title</strong>
                <div class="text-muted">Used in e-mail notifications towards your audience.</div>
            </b-col>
            <b-col md="8">
                <b-form-input @change="onChangeSettings" v-model="title" class="mr-3 mb-0" />
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>End date</strong>
                <div class="text-muted">Configure an optional end date for this campaign.</div>
            </b-col>
            <b-col md="8">
                <b-row>
                    <b-col md="6">
                        <b-input-group>
                            <b-datepicker
                                value-as-date
                                :min="minDate"
                                v-model="expirationDate"
                                @input="onChangeSettings()"
                            />
                            <b-input-group-append>
                                <b-button @click="onClickExpirationDateReset" variant="dark">
                                    <i class="fas fa-trash ml-0"></i>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-col>
                    <b-col md="6">
                        <b-input-group>
                            <b-timepicker
                                :disabled="!expirationDate"
                                v-model="expirationTime"
                                @input="onChangeSettings()"
                            />
                            <b-input-group-append>
                                <b-button @click="onClickExpirationTimeReset" variant="dark">
                                    <i class="fas fa-trash ml-0"></i>
                                </b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-col>
                </b-row>
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
                        <b-form-group>
                            <b-form-file class="mb-3" @change="onUpload($event, 'logoImgUrl')" accept="image/*" />
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
                        <b-form-group>
                            <b-form-file @change="onUpload($event, 'backgroundImgUrl')" accept="image/*" />
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
                <p class="text-muted">Invite people from your team to collaborate on this campaign.</p>
            </b-col>
            <b-col md="8">
                <b-form-group label="E-mail" :state="isValidCollaboratorEmail">
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
                                Send Invite
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
                <b-list-group>
                    <b-list-group-item class="d-flex justify-content-between align-items-center">
                        {{ profile.email }}
                        <b-badge variant="dark" class="p-2">Owner</b-badge>
                    </b-list-group-item>
                    <b-list-group-item
                        :key="key"
                        v-for="(c, key) of pool.collaborators"
                        class="d-flex justify-content-between align-items-center"
                    >
                        {{ c.email }}
                        <b-badge variant="light" class="p-2">{{ CollaboratorInviteState[c.state] }}</b-badge>
                    </b-list-group-item>
                </b-list-group>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4"> </b-col>
            <b-col md="8">
                <b-form-group>
                    <b-form-group>
                        <b-form-checkbox @change="onChangeSettings" v-model="isWeeklyDigestEnabled" class="mr-3">
                            <strong>Weekly Digest</strong><br />
                            <span class="text-muted">
                                Every week on monday we will send you the latest activity metrics for this loyalty pool.
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
import { TAccount, TPoolSettings } from '@thxnetwork/types/interfaces';
import { validateEmail } from '@thxnetwork/dashboard/components/modals/BaseModalRequestAccountEmailUpdate.vue';
import { CollaboratorInviteState } from '@thxnetwork/types/enums';

@Component({
    computed: {
        ...mapGetters({
            brands: 'brands/all',
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsView extends Vue {
    CollaboratorInviteState = CollaboratorInviteState;
    loading = true;
    chainInfo = chainInfo;
    profile!: TAccount;
    pools!: IPools;
    brands!: { [poolId: string]: TBrand };
    error: string | null = null;
    title = '';
    logoImgUrl = '';
    backgroundImgUrl = '';
    isWeeklyDigestEnabled = false;
    isArchived = false;
    minDate: Date | null = null;
    expirationDate: Date | null = null;
    expirationTime = '00:00:00';
    emailCollaborator = '';
    get pool() {
        return this.pools[this.$route.params.id];
    }

    get isValidCollaboratorEmail() {
        if (!this.emailCollaborator) return;
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

        this.title = this.pool.settings.title;
        this.isArchived = this.pool.settings.isArchived;
        this.isWeeklyDigestEnabled = this.pool.settings.isWeeklyDigestEnabled;
        this.minDate = this.getMinDate();

        if (this.pool.settings.endDate) {
            this.expirationDate = new Date(this.pool.settings.endDate);
            this.expirationTime = `${this.expirationDate.getHours()}:${this.expirationDate.getMinutes()}:${this.expirationDate.getSeconds()}`;
        }

        this.loading = false;
    }

    getMinDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }

    getEndDate() {
        if (!this.expirationDate) return null;
        const endDate = new Date(this.expirationDate);
        const parts = this.expirationTime.split(':');
        endDate.setHours(Number(parts[0]));
        endDate.setMinutes(Number(parts[1]));
        endDate.setSeconds(Number(parts[2]));
        return endDate;
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

    async onChangeSettings(setting?: TPoolSettings) {
        const settings = Object.assign(
            {
                title: this.title,
                endDate: this.getEndDate(),
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

    async onClickCollaboratorInvite() {
        if (!this.isValidCollaboratorEmail) return;

        this.loading = true;

        await this.$store.dispatch('pools/inviteCollaborator', {
            pool: this.pool,
            email: this.emailCollaborator,
        });
        this.loading = false;
    }

    onClickExpirationDateReset() {
        this.expirationDate = null;
        this.expirationTime = '00:00:00';
        this.onChangeSettings();
    }

    onClickExpirationTimeReset() {
        this.expirationTime = '00:00:00';
        this.onChangeSettings();
    }
}
</script>
