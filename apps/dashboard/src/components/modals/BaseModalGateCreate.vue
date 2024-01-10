<template>
    <base-modal
        @show="$emit('show')"
        size="xl"
        :title="(gate ? 'Update ' : 'Create ') + GateVariant[variant] + ` Gate`"
        :id="id"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="submit" id="formGateCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <slot name="col-left" />
                    </b-col>
                    <b-col md="6">
                        <template v-if="[GateVariant.ERC20, GateVariant.ERC721, GateVariant.ERC1155].includes(variant)">
                            <b-form-group
                                label="Contract Address"
                                description="Provide a smart contract address on Polygon."
                            >
                                <b-form-input v-model="contractAddress" />
                            </b-form-group>
                            <b-form-group
                                label="Amount"
                                min="0"
                                description="Determine the minimal result the balanceOf methods of this smart contract should return."
                            >
                                <b-form-input min="0" type="number" v-model="amount" />
                            </b-form-group>
                        </template>
                        <b-form-group
                            label="Score Minimum"
                            description="Determine the minimal score Gitcoins Unique Humanity scorer should return for a given wallet address."
                            v-if="[GateVariant.UniqueHumanity].includes(variant)"
                        >
                            <b-form-input min="0" max="100" type="number" v-model="score" />
                        </b-form-group>
                        <slot name="col-right" />
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button class="rounded-pill" type="submit" form="formGateCreate" variant="primary" block>
                {{ (gate ? 'Update ' : 'Create ') + GateVariant[variant] + ` Gate` }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import { TGate } from '@thxnetwork/common/lib/types/interfaces/Gate';
import { TPool } from '@thxnetwork/common/lib/types/interfaces';
import { GateVariant } from '@thxnetwork/common/lib/types/enums';

@Component({
    components: {
        BaseModal,
    },
})
export default class ModalGateCreate extends Vue {
    GateVariant = GateVariant;
    isLoading = true;
    title = '';
    description = '';
    amount = 0;
    score = 0;
    contractAddress = '';

    @Prop() id!: string;
    @Prop() variant!: GateVariant;
    @Prop() gate!: TGate;
    @Prop() pool!: TPool;

    mounted() {
        this.isLoading = false;
        if (this.gate) {
            const { title, description, amount, score, contractAddress } = this.gate;
            this.title = title;
            this.description = description;
            this.amount = amount;
            this.score = score;
            this.contractAddress = contractAddress;
        }
    }

    async submit() {
        this.isLoading = true;
        await this.$store.dispatch('pools/createGate', {
            poolId: String(this.pool._id),
            variant: this.variant,
            title: this.title,
            description: this.description,
            amount: this.amount || undefined,
            score: this.score || undefined,
            contractAddress: this.contractAddress || undefined,
        });
        this.isLoading = false;
        this.$emit('submit');
    }
}
</script>
