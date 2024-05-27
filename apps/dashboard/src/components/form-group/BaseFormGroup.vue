<template>
    <b-form-group label-class="d-flex">
        <template #label>
            {{ label }}
            <span v-if="required" class="text-danger ml-1">*</span>
            <b-link v-if="tooltip" class="ml-auto" v-b-tooltip :title="tooltip">
                <i class="fas fa-info-circle text-gray" />
            </b-link>
        </template>
        <slot />
        <div class="small text-muted">
            <slot name="description">
                {{ description }}
            </slot>
        </div>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseFormGroup extends Vue {
    @Prop() label!: string;
    @Prop() tooltip!: string;
    @Prop() description!: string;
    @Prop({ type: Boolean, default: false }) required!: boolean;
}
</script>
