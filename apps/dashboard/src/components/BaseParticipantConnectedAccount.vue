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
import { getUserUrl, platformIconMap, tokenKindPlatformMap } from '../types/rewards';
import { PlatformVariant } from '@thxnetwork/types/enums';

export function parseConnectedAccounts(accounts: any) {
    if (!accounts.length) return [];
    return accounts
        .map((a) => {
            const platformId = tokenKindPlatformMap[a.kind];
            return (
                platformId && {
                    platform: {
                        name: PlatformVariant[platformId],
                        icon: platformIconMap[platformId],
                    },
                    userName: a.metadata ? a.metadata.username : '',
                    userId: a.userId,
                    url: getUserUrl(a),
                }
            );
        })
        .filter((a) => a);
}

@Component({})
export default class BaseParticipantConnectedAccount extends Vue {
    @Prop() account!: { url: string; platform: { icon: string }; userName: string; userId: string };
}
</script>
