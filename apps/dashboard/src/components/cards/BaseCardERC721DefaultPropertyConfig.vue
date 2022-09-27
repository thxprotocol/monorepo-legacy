<template>
    <b-card bg-variant="light">
        <b-row>
            <b-col md="6" class="mb-2">
                <b-form-group>
                    <template #label>
                        Name
                        <i
                            v-b-tooltip
                            class="fas fa-question-circle text-gray"
                            title="This field will be auto formatted into a computer readable format."
                        ></i>
                    </template>
                    <b-form-input
                        :disabled="prop.disabled"
                        placeholder="property_name"
                        :value="prop.name"
                        @input="onInputName"
                    />
                </b-form-group>
            </b-col>
            <b-col md="6" class="mb-2">
                <b-form-group>
                    <template #label>
                        Type
                        <i
                            v-b-tooltip
                            class="fas fa-question-circle text-gray"
                            title="This allows for uploading different data types when creating the metadata for this item."
                        ></i>
                    </template>
                    <b-select
                        :disabled="prop.disabled"
                        v-model="prop.propType"
                        @change="
                            $emit('changed', {
                                ...prop,
                                propType: $event,
                            })
                        "
                    >
                        <b-select-option :value="type.value" :key="key" v-for="(type, key) of propTypes">
                            {{ type.label }}
                        </b-select-option>
                    </b-select>
                </b-form-group>
            </b-col>
            <b-col md="12">
                <b-form-group>
                    <template #label>
                        Description
                        <i
                            v-b-tooltip
                            class="fas fa-question-circle text-gray"
                            title="This allows for uploading different data types when creating the metadata for this item."
                        ></i>
                    </template>
                    <b-form-textarea
                        :disabled="prop.disabled"
                        placeholder="A brief description of your property."
                        :value="prop.description"
                        @input="
                            $emit('changed', {
                                ...prop,
                                description: $event,
                            })
                        "
                    />
                </b-form-group>
                <div class="text-right pt-2" v-if="!prop.disabled">
                    <b-link class="text-danger" @click="$emit('deleted')" size="sm"> Remove </b-link>
                </div>
            </b-col>
        </b-row>
    </b-card>
</template>

<script lang="ts">
import { TERC721DefaultProp } from '@thxnetwork/dashboard/types/erc721';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { snakeCase } from 'change-case';

@Component({})
export default class BaseCardERC721DefaultPropertyConfig extends Vue {
    propTypes = [
        { label: 'Text', value: 'string' },
        { label: 'Link', value: 'link' },
        { label: 'Number', value: 'number' },
        { label: 'Image', value: 'image' },
    ];

    @Prop() prop!: TERC721DefaultProp;

    onInputName(value: string) {
        this.$emit('changed', {
            ...this.prop,
            name: snakeCase(value),
        });
    }
}
</script>
