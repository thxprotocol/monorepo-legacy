<template>
    <b-form-group
        label="Server ID"
        description="Enable 'Developer Mode' in 'App settings' > 'Advanced' and right click your server icon to Copy ID. "
    >
        <b-input-group prepend="#">
            <b-form-input @change="onChangeInput" :value="item" />
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
    @Prop({ required: false }) item!: string;

    onChangeInput(item: string) {
        this.$emit('selected', item);
    }
}
</script>
