<template>
    <div>
        <BaseFormGroupTwitterFollowersMin :amount="minFollowersCount" @input="onInputFollowersMin" />
        <BaseFormGroup
            required
            label="Username"
            tooltip="We will validate if this username is among the campaign participants list of followed accounts."
        >
            <b-input-group prepend="@">
                <b-form-input :debounce="1000" @change="onInput" :state="state" v-model="username" />
            </b-input-group>
            <b-card v-if="preview" body-class="d-flex align-items-center" class="mt-3">
                <b-avatar :src="preview.profile_image_url" class="mr-2" />
                <div>
                    <div>
                        <strong>{{ preview.name }}</strong>
                        <small> #{{ preview.id }}</small>
                    </div>
                    <b-link target="_blank">@{{ preview.username }}</b-link>
                </div>
            </b-card>
        </BaseFormGroup>
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseFormGroupTwitterFollowersMin from '@thxnetwork/dashboard/components/form-group/BaseFormGroupTwitterFollowersMin.vue';

@Component({
    components: {
        BaseFormGroupTwitterFollowersMin,
    },
})
export default class BaseDropdownTwitterUsers extends Vue {
    username = '';
    state: boolean | null = null;
    preview: { profile_image_url: string; name: string; id: string; username: string } | null = null;
    minFollowersCount = 0;

    @Prop({ required: false }) content!: number;
    @Prop({ required: false }) contentMetadata!: any;

    async mounted() {
        if (this.content && this.contentMetadata) {
            const { profileImgUrl, name, id, username, minFollowersCount } = this.contentMetadata;
            this.preview = {
                profile_image_url: profileImgUrl,
                name,
                id,
                username,
            };
            this.minFollowersCount = minFollowersCount || null;
            this.username = username;
        } else if (this.content && !this.contentMetadata) {
            const { data } = await axios({
                method: 'POST',
                url: '/account/twitter/user',
                data: { userId: this.content },
            });
            this.preview = data;
            this.username = data.username;
        }
    }

    onInputFollowersMin(amount: number) {
        this.minFollowersCount = amount;
        this.onInput(this.username);
    }

    async onInput(username: string) {
        if (username.length < 4) {
            this.preview = null;
            this.state = null;
            return;
        }

        const { data } = await axios({
            method: 'POST',
            url: '/account/twitter/user/by/username',
            data: { username },
        });

        if (!data) {
            this.preview = null;
            this.state = false;
        } else {
            this.preview = data;
            this.state = true;
            this.$emit('selected', {
                content: data.id,
                contentMetadata: {
                    id: data.id,
                    name: data.name,
                    profileImgUrl: data.profile_image_url,
                    username,
                    minFollowersCount: this.minFollowersCount,
                },
            });
        }
    }
}
</script>
