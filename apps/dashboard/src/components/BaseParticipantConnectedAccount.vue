<template>
    <span v-if="account" class="mr-1">
        <b-link v-if="account.url" :href="account.url" target="_blank">
            <i :class="account.platform.icon" class="text-gray" v-b-tooltip :title="account.userName" />
        </b-link>
        <i
            v-else
            :class="account.platform.icon"
            class="text-gray"
            v-b-tooltip
            :title="account.userName || account.userId"
        />
    </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { getPlatform, getUserUrl } from '../types/rewards';
import { providerIconMap } from '@thxnetwork/common/lib/types/maps/oauth';

export function parseConnectedAccounts(accounts: any) {
    if (!accounts.length) return [];
    return accounts
        .map((a) => {
            return {
                platform: {
                    name: getPlatform(a.kind)?.name,
                    icon: providerIconMap[a.kind],
                },
                userName: a.metadata ? a.metadata.username : '',
                userId: a.userId,
                url: getUserUrl(a),
            };
        })
        .filter((a) => a);
}

@Component({})
export default class BaseParticipantConnectedAccount extends Vue {
    @Prop() account!: { url: string; platform: { icon: string }; userName: string; userId: string };
}
</script>
