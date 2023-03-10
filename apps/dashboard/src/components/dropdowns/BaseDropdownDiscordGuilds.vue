<template>
    <b-form-group
        label="Server ID"
        description="Enable 'Developer Mode' in 'App settings' > 'Advanced' and right click your server icon to Copy ID. "
    >
        <b-input-group prepend="#">
            <b-form-input @change="onChangeInput" :value="serverId" />
        </b-input-group>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownDiscordGuilds extends Vue {
    serverId = '';

    @Prop({ required: false }) item!: string;

    mounted() {
        this.serverId = this.item ? this.item : '';
    }

    onChangeInput(serverId: string) {
        this.serverId = serverId;
        this.$emit('selected', this.serverId);
    }
}
</script>
