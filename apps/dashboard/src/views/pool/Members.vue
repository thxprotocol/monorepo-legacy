<template>
    <div class="container pt-3 h-100 d-flex flex-column">
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Members</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-button v-b-modal="'modalPoolMemberAdd'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">Add Member</span>
                </b-button>
            </b-col>
        </b-row>
        <b-card class="shadow-sm">
            <b-alert v-if="!members.length" variant="info" show> There are no members for this pool yet. </b-alert>
            <div class="row pt-2 pb-2">
                <div class="col-md-8">
                    <strong>Address</strong>
                </div>
                <div class="col-md-4"></div>
            </div>
            <b-form-group class="mb-0" :key="key" v-for="(member, key) of members">
                <hr />
                <div class="row pt-2 pb-2">
                    <div class="col-md-8 d-flex align-items-center">
                        {{ member.address }}
                    </div>
                </div>
            </b-form-group>
        </b-card>
        <b-pagination
            class="mt-3"
            @change="onChangePage"
            v-model="currentPage"
            :per-page="perPage"
            :total-rows="total"
            align="center"
        ></b-pagination>
        <base-modal-member-add :pool="pool" :onSuccess="onMemberAdded" />
    </div>
</template>

<script lang="ts">
import { GetMembersProps, GetMembersResponse, IPools } from '@thxprotocol/dashboard/store/modules/pools';
import { IMemberByPage } from '@thxprotocol/dashboard/types/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

import BaseModalMemberAdd from '@thxprotocol/dashboard/components/modals/BaseModalMemberAdd.vue';

@Component({
    components: {
        BaseModalMemberAdd,
    },
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class Members extends Vue {
    memberPerPage: IMemberByPage = {};
    loading = false;
    currentPage = 1;
    perPage = 10;
    total = 0;

    pools!: IPools;

    get members() {
        return this.memberPerPage[this.currentPage] || [];
    }

    get pool() {
        return this.pools[this.$route.params.id];
    }

    async getMoreMembers({ pool, page, limit }: GetMembersProps) {
        this.loading = true;
        const response: GetMembersResponse = await this.$store.dispatch('pools/getMembers', {
            pool,
            page,
            limit,
        });

        Vue.set(this.memberPerPage, this.currentPage, response.results);
        this.total = response.total;
        this.loading = false;
    }

    async onChangePage(page: number) {
        await this.getMoreMembers({
            pool: this.pool,
            page: page,
            limit: this.perPage,
        });
    }

    async onMemberAdded() {
        this.currentPage = 1;
        this.onChangePage(1);
        this.$bvModal.hide('modalPoolMemberAdd');
    }

    async mounted() {
        await this.getMoreMembers({
            pool: this.pool,
            page: this.currentPage,
            limit: this.perPage,
        });
    }
}
</script>
