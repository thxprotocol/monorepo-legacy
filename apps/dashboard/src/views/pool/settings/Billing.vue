<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Invoices</strong>
                <p class="text-muted">Invoice data is updated every 5 minutes.</p>
            </b-col>
            <b-col md="8">
                <b-form-group label="Invoices">
                    <BTable :items="invoices" hover show-empty responsive="lg">
                        <!-- Head formatting -->
                        <template #head(costTotal)> Amount </template>
                        <template #head(period)> Invoice Period </template>
                        <template #head(plan)> Plan </template>
                        <template #head(costAdditional)> Additional Costs </template>

                        <!-- Cell formatting -->
                        <template #cell(costTotal)="{ item }">
                            <code>{{ item.costTotal }}</code>
                        </template>
                        <template #cell(period)="{ item }"> {{ item.period.start }} - {{ item.period.end }} </template>
                        <template #cell(plan)="{ item }">
                            {{ AccountPlanType[item.plan] }}
                        </template>
                        <template #cell(identity)="{ item }">
                            <b-dropdown variant="link" size="sm" right no-caret>
                                <template #button-content>
                                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                                </template>
                                <b-dropdown-item @click="onClickDelete(item.identity)"> Delete </b-dropdown-item>
                            </b-dropdown>
                        </template>
                    </BTable>
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
    </div>
</template>

<script lang="ts">
import { TInvoiceState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccountPlanType } from '@thxnetwork/common/enums';

@Component({
    computed: mapGetters({
        poolList: 'pools/all',
        invoiceList: 'pools/invoices',
    }),
})
export default class WidgetsView extends Vue {
    AccountPlanType = AccountPlanType;

    poolList!: IPools;
    invoices!: TInvoiceState;

    get pool() {
        return this.poolList[this.$route.params.id];
    }

    get invoices() {
        if (!this.invoiceList[this.$route.params.id]) return [];

        return this.invoiceList[this.$route.params.id].map((invoice: TInvoice) => ({
            plan: invoice.plan,
            costTotal: invoice.costTotal,
            period: {
                start: new Date(invoice.periodStartDate).toLocaleDateString(),
                end: new Date(invoice.periodEndDate).toLocaleDateString(),
            },
            costAdditional: invoice.additionalUnitCount * invoice.costPerUnit,
        }));
    }

    mounted() {
        debugger;
        this.getInvoices();
    }

    async getInvoices() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listInvoices', { pool: this.pool });
        this.isLoading = false;
    }
}
</script>
