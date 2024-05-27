<template>
    <BaseFormGroup
        label="Followers Count"
        tooltip="We can check for a minimum follower count in order to mitigate against automated behavior. Note that how higher the follower base, the more reach your content gets."
    >
        <b-form-input type="number" :value="amount" @input="$emit('input', $event)" min="0" />
    </BaseFormGroup>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseFormGroupTwitterFollowersMin extends Vue {
    @Prop({ default: 25 }) amount!: number;
}
</script>
