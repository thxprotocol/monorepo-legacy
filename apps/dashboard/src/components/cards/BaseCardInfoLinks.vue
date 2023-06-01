<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-token-gating
        >
            <strong>Info URL's</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-token-gating" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <slot></slot>
                <b-form-group :key="key" v-for="(link, key) of infoLinks">
                    <b-row>
                        <b-col md="3">
                            <b-input-group>
                                <b-form-input
                                    placeholder="Label"
                                    :value="infoLinks[key].label"
                                    @change="$emit('change-link', { key, label: $event })"
                                />
                            </b-input-group>
                        </b-col>
                        <b-col md="9">
                            <b-input-group>
                                <b-form-input
                                    placeholder="https://example.com"
                                    :value="infoLinks[key].url"
                                    @change="$emit('change-link', { key, url: $event })"
                                />
                                <b-input-group-append>
                                    <b-button variant="gray" @click="$emit('change-link', { key })">
                                        <i class="fas fa-times ml-0"></i>
                                    </b-button>
                                </b-input-group-append>
                            </b-input-group>
                        </b-col>
                    </b-row>
                </b-form-group>
                <b-form-group class="text-center">
                    <b-link @click="onClickAddLink">Add another info link</b-link>
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TInfoLink, TPool } from '@thxnetwork/types/interfaces';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';

@Component({})
export default class BaseCardInfoLinks extends Vue {
    isVisible = false;
    isValidUrl = isValidUrl;

    @Prop() pool!: TPool;
    @Prop() infoLinks!: TInfoLink[];

    mounted() {
        this.isVisible = !!this.infoLinks.length;
    }

    onClickAddLink() {
        this.$emit('change-link', { key: this.infoLinks.length, label: '', url: '' });
    }
}
</script>
