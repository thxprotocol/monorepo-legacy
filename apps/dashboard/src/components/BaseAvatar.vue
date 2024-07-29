<template>
    <b-media>
        <template #aside>
            <b-avatar
                v-b-tooltip
                :title="account ? `${account._id} (${account.variant})` : ''"
                :src="account && account.profileImg"
                size="sm"
                variant="light"
            />
        </template>
        <span v-if="account">{{ account.username }}</span>
        <span v-else class="text-muted">Removed account</span>
    </b-media>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseParticipantAccount extends Vue {
    @Prop() account!: TAccount;
}
</script>
