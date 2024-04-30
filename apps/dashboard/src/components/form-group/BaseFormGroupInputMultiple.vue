<template>
    <div class="d-flex align-items-start w-100">
        <div class="d-flex align-items-start mr-2 flex-grow-0" style="min-width: 90px">
            {{ label }}
            <b-link v-if="tooltip" class="text-muted ml-auto" v-b-tooltip :title="tooltip">
                <i class="fas fa-info-circle" />
            </b-link>
        </div>
        <div class="flex-grow-1">
            <div v-for="(value, key) of fields" :key="key" class="mb-1 mx-1">
                <b-input-group size="sm">
                    <template #prepend v-if="prepend">
                        <b-input-group-text class="bg-transparent">{{ prepend }} </b-input-group-text>
                    </template>
                    <b-form-textarea
                        :value="fields[key]"
                        @input="onInput(key, $event)"
                        size="sm"
                        rows="1"
                        maxrows="6"
                    />
                    <template #append>
                        <b-button variant="link" size="sm" @click="onClickRemove" class="bg-dark text-white border-0">
                            <i class="fas fa-times m-0" />
                        </b-button>
                    </template>
                </b-input-group>
            </div>
            <b-button variant="dark" class="text-white" size="sm" @click="fields.push('')">
                <i class="fas fa-plus m-0" />
            </b-button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class IntegrationTwitterView extends Vue {
    @Prop() label!: string;
    @Prop() tooltip!: string;
    @Prop() prepend!: string;
    @Prop() fields!: string[];

    onInput(key: number, value: string) {
        const fields = this.fields;
        fields[key] = value;
        this.$emit('input', fields);
    }

    onClickRemove(key: number) {
        const fields = this.fields;
        fields.splice(key, 1);
        this.$emit('input', fields);
    }
}
</script>
