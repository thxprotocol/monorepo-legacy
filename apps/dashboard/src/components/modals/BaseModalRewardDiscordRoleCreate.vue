<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' Discord Role Reward'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit" id="formRewardDiscordRoleCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Discord Roles">
                            <BaseDropdownDiscordRole
                                @click="discordRoleId = $event.id"
                                :role-id="discordRoleId"
                                :guilds="pool.guilds"
                            />
                        </b-form-group>
                        <b-form-group label="Point Price">
                            <b-form-input type="number" :value="pointPrice" @input="onChangePointPrice" />
                        </b-form-group>
                        <b-form-group label="Image">
                            <b-input-group>
                                <template #prepend v-if="image">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="image" height="35" width="auto" alt="Reward image" />
                                    </div>
                                </template>
                                <b-form-file v-model="imageFile" accept="image/*" @change="onImgChange" />
                            </b-input-group>
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits class="mb-3" :limit="limit" @change-reward-limit="limit = $event" />
                        <BaseCardTokenGating
                            class="mb-3"
                            :pool="pool"
                            :perk="reward"
                            @change-contract-address="tokenGatingContractAddress = $event"
                            @change-amount="tokenGatingAmount = $event"
                            @change-variant="tokenGatingVariant = $event"
                        />
                        <b-form-group>
                            <b-form-checkbox v-model="isPromoted">Promoted</b-form-checkbox>
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardDiscordRoleCreate"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' Discord Role Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseCardTokenGating from '../cards/BaseCardTokenGating.vue';
import BaseDropdownDiscordRole from '../dropdowns/BaseDropdownDiscordRole.vue';
import { TokenGatingVariant, RewardVariant } from '@thxnetwork/types/enums';
import type { TAccount, TPool, TDiscordRoleReward } from '@thxnetwork/types/interfaces';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
        BaseCardTokenGating,
        BaseDropdownDiscordRole,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class ModalRewardCustomCreate extends Vue {
    isLoading = false;

    pools!: IPools;
    profile!: TAccount;

    fileCoupons: File | null = null;
    error = '';
    title = '';
    description = '';
    expiryDate: Date | null = null;
    codes: string[] = [];
    limit = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    webshopURL = '';
    isPromoted = false;
    tokenGatingVariant = TokenGatingVariant.ERC721;
    tokenGatingContractAddress = '';
    tokenGatingAmount = 0;
    discordRoleId = '';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TDiscordRoleReward;

    get isSubmitDisabled() {
        return this.isLoading;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.pointPrice = this.reward ? this.reward.pointPrice : this.pointPrice;
        this.expiryDate = this.reward ? this.reward.expiryDate : this.expiryDate;
        this.limit = this.reward ? this.reward.limit : this.limit;
        this.image = this.reward ? this.reward.image : this.image;
        this.isPromoted = this.reward ? this.reward.isPromoted : this.isPromoted;
        this.tokenGatingContractAddress = this.reward
            ? this.reward.tokenGatingContractAddress
            : this.tokenGatingContractAddress;
        this.tokenGatingVariant = this.reward ? this.reward.tokenGatingVariant : this.tokenGatingVariant;
        this.tokenGatingAmount = this.reward ? this.reward.tokenGatingAmount : this.tokenGatingAmount;
        this.discordRoleId = this.reward ? this.reward.discordRoleId : this.discordRoleId;
    }

    onChangePointPrice(price: number) {
        this.pointPrice = price;
    }

    onSubmit() {
        this.isLoading = true;

        const payload = {
            ...this.reward,
            variant: RewardVariant.DiscordRole,
            poolId: this.pool._id,
            title: this.title,
            description: this.description,
            file: this.imageFile,
            expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
            limit: this.limit,
            pointPrice: this.pointPrice,
            isPromoted: this.isPromoted,
            tokenGatingContractAddress: this.tokenGatingContractAddress,
            tokenGatingVariant: this.tokenGatingVariant,
            tokenGatingAmount: this.tokenGatingAmount,
            discordRoleId: this.discordRoleId,
        };

        this.$store.dispatch(`discordRoleRewards/${this.reward ? 'update' : 'create'}`, payload).then(() => {
            this.isLoading = false;
            this.$bvModal.hide(this.id);
            this.$emit('submit');
        });
    }

    onImgChange() {
        this.image = '';
    }
}
</script>
