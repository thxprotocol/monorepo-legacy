<template>
    <div>
        <label>Your Playlists:</label>
        <b-dropdown variant="link" class="dropdown-select bg-white mb-3">
            <template #button-content>
                <div v-if="selected" class="d-flex align-items-center text-overflow-ellipsis">
                    <img
                        :src="selected.images[0].url"
                        v-if="selected.images[0]"
                        width="30"
                        class="mr-2"
                        :alt="selected.name"
                    />
                    {{ selected.name }}
                </div>
            </template>
            <b-dropdown-item-button :key="item.id" v-for="item of items" @click="onItemClick(item)">
                <div class="d-flex">
                    <div class="d-flex align-items-center">
                        <img
                            :src="item.images[0].url"
                            v-if="item.images[0]"
                            height="50"
                            width="auto"
                            class="mr-3"
                            :alt="item.name"
                        />
                    </div>
                    <div class="d-flex align-items-center">
                        <div>
                            {{ item.name }}
                        </div>
                    </div>
                </div>
            </b-dropdown-item-button>
        </b-dropdown>

        <div>
            <label>Spotify Playlist URL:</label>
            <b-form-input
                :class="{ 'is-valid': trackId.length }"
                class="mb-3"
                placeholder="https://open.spotify.com/playlist/37i9dQZF1DWUFAJPVM3HTX"
                v-model="value"
            />

            <b-alert show variant="info" v-if="trackId">
                Spotify Playlist ID: <strong> {{ trackId }}</strong>
            </b-alert>
        </div>
    </div>
</template>

<script lang="ts">
import { BAlert, BButton, BFormInput, BInputGroup, BInputGroupAppend } from 'bootstrap-vue';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BAlert,
        BButton,
        BInputGroup,
        BFormInput,
        BInputGroupAppend,
    },
    computed: mapGetters({}),
})
export default class BaseDropdownSpotifyPlaylists extends Vue {
    @Prop() items!: any;
    @Prop({ required: false }) item: any;

    trackId = '';
    value = '';

    selected: any = null;

    mounted() {
        if (!this.item) {
            this.selected = this.items[0];
            this.$emit('selected', { id: this.selected.id });
        } else {
            const isUserPlaylist = this.items.find((playlist: any) => playlist.id === this.item);
            if (isUserPlaylist) this.selected = isUserPlaylist;
            else {
                this.selected = this.items[0];
                this.value = `https://https://open.spotify.com/playlist/${this.item}`;
            }
        }
    }

    onItemClick(item: any) {
        this.selected = item;
        this.$emit('selected', item);
    }

    @Watch('value')
    onChange(url: string) {
        const result = url.replace(/.*\/(?:playlist)\/([\w-]{22}).*/, '$1');

        if (result) {
            this.trackId = result;
            this.$emit('selected', { id: result });
        } else {
            this.trackId = '';
        }
    }
}
</script>
