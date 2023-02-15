<template>
    <b-form-group
        label="User ID"
        description="Get your user id by proving us with the URL shown when sending someone a message."
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
