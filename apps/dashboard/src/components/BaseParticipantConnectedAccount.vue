<template>
    <span v-if="account" class="mr-1">
        <b-link :id="`popover-user-${account.userId}`">
            <i :class="account.platform.icon" class="text-gray" />
        </b-link>
        <b-popover v-b-popover :target="`popover-user-${account.userId}`" triggers="hover">
            <template v-if="account.kind !== AccessTokenKind.Twitter">
                {{ account.userId }}
            </template>
            <template v-else-if="account.user">
                <b-media class="pt-2">
                    <template #aside>
                        <b-avatar :src="account.user.profileImgUrl" size="2.8rem" class="ml-1" />
                    </template>
                    <strong>{{ account.user.name }}</strong>
                    <br />
                    <b-link :href="`https://x.com/${account.user.username.toLowerCase()}`" target="_blank">
                        @{{ account.user.username }}
                    </b-link>
                </b-media>
                <template v-if="account.user.publicMetrics">
                    <b-row class="text-muted mt-2">
                        <b-col>Followers</b-col>
                        <b-col>{{ account.user.publicMetrics.followersCount }}</b-col>
                    </b-row>
                    <b-row class="text-muted mt-2">
                        <b-col>Following</b-col>
                        <b-col>{{ account.user.publicMetrics.followingCount }}</b-col>
                    </b-row>
                    <b-row class="text-muted mt-2">
                        <b-col>Tweets</b-col>
                        <b-col>{{ account.user.publicMetrics.tweetCount }}</b-col>
                    </b-row>
                    <b-row class="text-muted mt-2">
                        <b-col>Likes</b-col>
                        <b-col>{{ account.user.publicMetrics.likeCount }}</b-col>
                    </b-row>
                </template>
            </template>
            <template v-else-if="!account.user">
                <b-link :href="`https://www.x.com/${account.metadata.username}`" target="_blank">
                    @{{ account.metadata.username }}
                </b-link>
            </template>
        </b-popover>
    </span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { getPlatform, getUserUrl } from '../types/rewards';
import { providerIconMap } from '@thxnetwork/common/lib/types/maps/oauth';
import { AccessTokenKind, TToken, TTwitterUser } from '@thxnetwork/common/lib/types';

export function parseConnectedAccounts(account: { tokens: TToken[] }) {
    if (!account.tokens.length) return [];
    return account.tokens
        .map((a: TToken & { user?: TTwitterUser }) => {
            return {
                platform: {
                    name: getPlatform(a.kind)?.name,
                    icon: providerIconMap[a.kind],
                },
                kind: a.kind,
                user: a.user,
                userId: a.userId,
                metadata: a.metadata,
                url: getUserUrl(a),
            };
        })
        .filter((a) => a);
}

@Component({})
export default class BaseParticipantConnectedAccount extends Vue {
    AccessTokenKind = AccessTokenKind;

    @Prop() account!: {
        kind: AccessTokenKind;
        url: string;
        platform: { icon: string };
        userName: string;
        userId: string;
        user: TTwitterUser;
        metadata: { username: string };
    };
}
</script>
