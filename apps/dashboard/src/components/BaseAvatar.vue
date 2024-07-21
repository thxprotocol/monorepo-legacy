<template>
    <b-media>
        <template #aside>
            <b-avatar
                v-b-tooltip
                :title="account.id ? `${account.id} (${account.variant})` : ''"
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
import { AccessTokenKind } from '@thxnetwork/common/enums';

@Component({})
export default class BaseParticipantAccount extends Vue {
    @Prop() account!: { id: string; variant: AccessTokenKind; username: string; profileImg: string; email: string };
}
</script>
