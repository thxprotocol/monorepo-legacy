<template>
    <b-media v-if="account">
        <template #aside>
            <b-avatar
                v-b-tooltip
                :title="`${account.id} (${account.variant})`"
                :src="account.profileImg"
                size="sm"
                variant="light"
            />
        </template>
        {{ account.email }}
    </b-media>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AccessTokenKind } from '@thxnetwork/types/enums';
import { AccountVariant } from '../types/enums/AccountVariant';

export function parseAccount({ id, account }) {
    if (!account) return;
    return {
        id,
        email: account && account.email,
        profileImg: account && account.profileImg,
        twitterUsername: account && account.twitterUsername,
        variant: account && AccountVariant[account.variant],
    };
}

@Component({})
export default class BaseParticipantAccount extends Vue {
    @Prop() account!: { id: string; variant: AccessTokenKind; profileImg: string; email: string };
}
</script>
