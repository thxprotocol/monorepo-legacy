<template>
    <BaseAvatar v-if="plain" :account="account" />
    <b-link
        v-else
        :to="account.username ? `/campaign/${$route.params.id}/participants/${account.username.toLowerCase()}` : null"
    >
        <BaseAvatar :account="account" />
    </b-link>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AccountVariant, AccessTokenKind } from '@thxnetwork/common/enums';
import BaseAvatar from '@thxnetwork/dashboard/components/BaseAvatar.vue';

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

@Component({
    components: {
        BaseAvatar,
    },
})
export default class BaseParticipantAccount extends Vue {
    @Prop() plain!: { type: boolean; default: false };
    @Prop() account!: { id: string; variant: AccessTokenKind; username: string; profileImg: string; email: string };
}
</script>
