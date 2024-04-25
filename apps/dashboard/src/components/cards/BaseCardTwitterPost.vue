<template>
    <b-card class="h-100 mb-3" no-body header-class="p-0">
        <template #header>
            <div @click="isVisible = !isVisible" class="d-flex p-2 align-items-center cursor-pointer px-3">
                <b-avatar class="mr-2" size="45" :src="post.user.profile_image_url"></b-avatar>
                <div class="mr-auto">
                    <div>{{ post.user.name }}</div>
                    <b-link
                        @click.stop="openURL(`https://twitter.com/${post.user.username.toLowerCase()}`)"
                        class="text-primary"
                    >
                        @{{ post.user.username }}
                    </b-link>
                </div>
                <div>
                    <b-badge variant="light" class="p-2 mr-1 mt-1">
                        <i :class="iconMap['impression_count']" class="mr-1" />
                        {{ post.public_metrics['impression_count'] }}
                    </b-badge>
                </div>
            </div>
        </template>
        <b-collapse v-model="isVisible">
            <div class="text-muted small p-3">
                <b-img
                    v-if="post.media && post.media[0].type == 'photo'"
                    :src="post.media[0].url"
                    :width="post.media[0].width"
                    :height="post.media[0].height"
                    style="max-width: 150px; max-height: 100px; width: auto; height: auto"
                    class="float-right m-1"
                />
                <b-link
                    v-if="post.media && post.media[0].type == 'video'"
                    :href="post.media[0].url"
                    target="_blank"
                    class="float-right"
                >
                    <b-img
                        :src="post.media[0].preview_image_url"
                        :width="post.media[0].width"
                        :height="post.media[0].height"
                        style="max-width: 150px; max-height: 100px; width: auto; height: auto"
                    />
                </b-link>
                {{ post.text }}
            </div>
            <div class="d-flex align-items-center text-muted my-1 small px-3" style="clear: both">
                {{ format(new Date(post.created_at), 'dd-MM-yyyy HH:mm') }}
                <b-button
                    class="ml-auto"
                    variant="link"
                    size="sm"
                    :href="`https://twitter.com/${post.user.username.toLowerCase()}/status/${post.id}`"
                    target="_blank"
                >
                    <i class="fas fa-external-link-alt mr-1" />
                    View on 𝕏
                </b-button>
            </div>
            <div class="d-flex pb-3 px-3">
                <b-badge variant="light" class="p-2 mr-1 mt-1" v-for="(value, key) of post.public_metrics" :key="key">
                    <i :class="iconMap[key]" class="mr-1" />
                    {{ value }}
                </b-badge>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';

const iconMap = {
    retweet_count: 'fas fa-retweet',
    reply_count: 'fas fa-reply',
    like_count: 'fas fa-heart',
    quote_count: 'fas fa-quote-right',
    bookmark_count: 'fas fa-bookmark',
    impression_count: 'fas fa-eye',
};

@Component({})
export default class BaseCardInfoLinks extends Vue {
    isVisible = false;
    format = format;
    iconMap = iconMap;

    @Prop() post!: TTwitterPostResponse & { user: TTwitterUserResponse; media: TTwitterMediaResponse[] };

    openURL(path: string) {
        window.open(path, '_blank');
    }
}
</script>
