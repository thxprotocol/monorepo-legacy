<template>
    <BaseFormGroup label="Network">
        <BaseDropdownNetwork @selected="$emit('selected', $event)" :chain-id="chainId" :disabled="disabled" />
    </BaseFormGroup>
</template>

<script lang="ts">
import { ChainId } from '@thxnetwork/common/enums';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseDropdownNetwork from '@thxnetwork/dashboard/components/dropdowns/BaseDropdownNetwork.vue';

@Component({
    components: {
        BaseDropdownNetwork,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseFormGroupNetwork extends Vue {
    @Prop() chainId!: ChainId;
    @Prop() disabled!: boolean;
}
</script>
