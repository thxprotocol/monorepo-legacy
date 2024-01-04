<template>
    <b-form-group
        label="Followers Count"
        description="To prevent quest abuse we can check for a minimum follower count."
    >
        <b-form-input type="number" :value="amount" @input="$emit('input', $event)" min="0" />
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseFormGroupTwitterFollowersMin extends Vue {
    @Prop({ default: 25 }) amount!: number;
}
</script>
