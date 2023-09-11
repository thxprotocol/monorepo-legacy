<template>
    <div>
        <b-link v-if="account.url" :href="account.url" target="_blank" class="mr-1">
            <i :class="account.platform.icon" class="text-gray" v-b-tooltip :title="account.userName" />
        </b-link>
        <i v-else :class="account.platform.icon" class="text-gray mr-1" v-b-tooltip :title="account.userId" />
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { getUserUrl, platformIconMap, tokenKindPlatformMap } from '../types/rewards';
import { PlatformVariant } from '@thxnetwork/types/enums';

export function parseConnectedAccounts(accounts: any) {
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

    mounted() {
        console.log(this.account);
    }
}
</script>
