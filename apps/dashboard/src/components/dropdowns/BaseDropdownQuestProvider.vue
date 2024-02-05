<template>
    <b-dropdown
        variant="light"
        toggle-class="form-control d-flex align-items-center justify-content-between"
        menu-class="w-100"
        class="w-100"
    >
        <template #button-content>
            <template v-if="provider">
                <div class="d-flex align-items-center justify-content-start">
                    <img :src="provider.logoURI" v-if="provider.logoURI" width="20" class="mr-2" :alt="provider.name" />
                    {{ provider.name }}
                </div>
            </template>
        </template>
        <b-dropdown-item-button :key="p.kind" v-for="p of providerList" @click="$emit('selected', p)">
            <img :src="p.logoURI" v-if="p.logoURI" width="20" class="mr-3" :alt="p.name" />
            {{ p.name }}
        </b-dropdown-item-button>
    </b-dropdown>
</template>

<script lang="ts">
import { TQuestSocialProvider, providerList } from '@thxnetwork/dashboard/types/rewards';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownQuestProvider extends Vue {
    providerList = providerList;

    @Prop({ default: () => providerList[0] }) provider!: TQuestSocialProvider;
}
</script>
