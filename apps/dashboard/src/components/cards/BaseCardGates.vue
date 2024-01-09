<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-token-gating
        >
            <strong>Gates</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-token-gating" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <b-form-group
                    label="Select Gates"
                    description="Require a token balance, token ownership or use Gitcoins scoring mechanism to proof unique humanity."
                >
                    <b-form-select @input="onInput" v-model="selectedGates" :options="options" multiple />
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TGate, TGateState } from '@thxnetwork/common/lib/types/interfaces/Gate';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        gateList: 'pools/gates',
    }),
})
export default class BaseCardGates extends Vue {
    isLoading = false;
    isVisible = true;
    page = 1;
    limit = 10;
    result = {
        results: [],
        total: 0,
    };
    gateList!: TGateState;
    selectedGates: string[] = [];

    @Prop() pool!: TGate;
    @Prop() gateIds!: string[];

    get gates() {
        if (!this.gateList[this.pool._id]) return [];
        return this.gateList[this.pool._id].results;
    }

    get options() {
        return this.gates.map((gate: TGate) => ({ text: gate.title, value: gate._id }));
    }

    async mounted() {
        await this.getGates();
        this.selectedGates = this.gateIds;
    }

    async getGates() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listGates', {
            pool: this.pool,
            page: this.page,
            limit: this.limit,
        });
        this.isLoading = false;
    }

    onInput(gateIds: string[]) {
        this.$emit('change-gates', gateIds);
    }
}
</script>
