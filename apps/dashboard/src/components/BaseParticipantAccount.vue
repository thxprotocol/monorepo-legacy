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
        {{ account.username }}
    </b-media>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AccountVariant, AccessTokenKind } from '@thxnetwork/common/enums';

export function parseAccount({ id, account }) {
    if (!account) return;
    return {
        id,
        email: account && account.email,
        username: account && account.username,
        profileImg: account && account.profileImg,
        twitterUsername: account && account.twitterUsername,
        variant: account && AccountVariant[account.variant],
    };
}

@Component({})
export default class BaseParticipantAccount extends Vue {
    @Prop() account!: { id: string; variant: AccessTokenKind; username: string; profileImg: string; email: string };
}
</script>
