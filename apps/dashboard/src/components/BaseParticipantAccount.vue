<template>
    <b-media v-b-tooltip :title="`${account.id} (${account.variant})`">
        <template #aside>
            <b-avatar :src="account.profileImg" size="sm" variant="light" />
        </template>
        {{ account.email }}
    </b-media>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AccessTokenKind } from '@thxnetwork/types/enums';
import { AccountVariant } from '../types/enums/AccountVariant';

export function parseAccount({ id, account }) {
    return {
        id,
        email: (account && account.email) || 'None',
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
