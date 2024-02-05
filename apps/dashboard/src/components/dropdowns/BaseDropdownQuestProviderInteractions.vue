<template>
    <b-form-select :value="interaction" @change="$emit('change', $event)">
        <b-form-select-option :value="a" :key="key" v-for="(a, key) of interactions">{{ a.name }}</b-form-select-option>
    </b-form-select>
</template>

<script lang="ts">
import { TQuestSocialInteraction } from '@thxnetwork/dashboard/types/rewards';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownQuestProviderInteractions extends Vue {
    @Prop() interactions!: TQuestSocialInteraction[];
    @Prop() interaction!: TQuestSocialInteraction;
}
</script>
