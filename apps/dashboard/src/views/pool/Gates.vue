<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Gates</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-dropdown no-caret variant="primary" toggle-class="rounded-pill" right>
                    <template #button-content>
                        <i class="fas fa-plus mr-2 ml-0"></i>
                        New Gate
                    </template>
                    <b-dropdown-item-button
                        v-for="(variant, key) of Object.values(GateVariant).filter((v) => !isNaN(Number(v)))"
                        :key="key"
                        v-b-modal="`modalGateCreate-${GateVariant[variant]}`"
                        button-class="d-flex px-2"
                    >
                        {{ GateVariant[variant] }}
                        <ModalGateCreate
                            @submit="listGates"
                            :variant="variant"
                            :id="`modalGateCreate-${GateVariant[variant]}`"
                            :pool="pool"
                        />
                    </b-dropdown-item-button>
                </b-dropdown>
            </b-col>
        </b-row>
        <BCard class="shadow-sm mb-5" no-body v-if="pool">
            <BaseCardTableHeader
                :pool="pool"
                :page="page"
                :limit="limit"
                :total-rows="gates.total"
                :selectedItems="[]"
                :actions="[]"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BTable id="table-gates" hover :busy="isLoading" :items="gatesByPage" responsive="lg" show-empty>
                <template #head(gate)> &nbsp; </template>

                <template #cell(gate)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item disabled v-b-modal="`modalGateCreate${[item.gate.variant]}` + item.gate._id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item disabled @click="onClickDelete(item.gate)"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <ModalGateCreate
                        @submit="listGates"
                        :id="`modalGateCreate${[item.gate.variant]}` + item.gate._id"
                        :pool="pool"
                        :total="gates.length"
                        :gate="item.gate"
                    />
                </template>
            </BTable>
        </BCard>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { GateVariant } from '@thxnetwork/common/lib/types';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import ModalGateCreate from '@thxnetwork/dashboard/components/modals/BaseModalGateCreate.vue';
import { TGate, TGateState } from '@thxnetwork/common/lib/types/interfaces/Gate';

@Component({
    components: {
        BaseCardTableHeader,
        ModalGateCreate,
    },
    computed: mapGetters({
        pools: 'pools/all',
        gates: 'pools/gates',
        profile: 'account/profile',
    }),
})
export default class ViewGates extends Vue {
    pools!: IPools;
    gates!: TGateState;
    isLoading = false;
    format = format;
    page = 1;
    limit = 10;
    GateVariant = GateVariant;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get gatesByPage() {
        if (!this.gates[this.$route.params.id]) return [];
        return this.gates[this.$route.params.id].results.map((gate: TGate) => ({
            title: gate.title,
            amount: gate.amount,
            score: gate.score,
            gate: gate,
        }));
    }

    mounted() {
        this.listGates();
    }

    async listGates() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listGates', {
            pool: this.pool,
            page: this.page,
            limit: this.limit,
        });
        this.isLoading = false;
    }

    onChangePage(page: number) {
        this.page = page;
        this.listGates();
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listGates();
    }

    onClickDelete(gate: TGate) {
        this.$store.dispatch('pools/removeGate', gate);
    }
}
</script>
