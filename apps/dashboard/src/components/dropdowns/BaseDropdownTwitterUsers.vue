<template>
    <b-form-group label="Username">
        <b-input-group prepend="@">
            <b-form-input @change="onChange" :state="state" :value="username" />
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
export default class BaseDropdownDiscordGuilds extends Vue {
    username = '';
    state: boolean | null = null;
    preview: { profile_image_url: string; name: string; id: string; username: string } | null = null;

    @Prop({ required: false }) item!: number;

    async mounted() {
        if (this.item) {
            const { data } = await axios({
                method: 'POST',
                url: '/account/twitter/user',
                data: { userId: this.item },
            });
            this.username = data.username;
        }
    }

    async onChange(username: string) {
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
            this.$emit('selected', data.id);
        }
    }
}
</script>
