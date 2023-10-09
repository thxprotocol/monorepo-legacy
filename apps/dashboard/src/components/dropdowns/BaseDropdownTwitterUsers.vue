<template>
    <b-form-group label="Username">
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
    </b-form-group>
</template>

<script lang="ts">
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownTwitterUsers extends Vue {
    username = '';
    state: boolean | null = null;
    preview: { profile_image_url: string; name: string; id: string; username: string } | null = null;

    @Prop({ required: false }) content!: number;
    @Prop({ required: false }) contentMetadata!: any;

    async mounted() {
        if (this.content && this.contentMetadata) {
            const { profileImgUrl, name, id, username } = JSON.parse(this.contentMetadata);
            this.preview = {
                profile_image_url: profileImgUrl,
                name,
                id,
                username,
            };
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
                },
            });
        }
    }
}
</script>
