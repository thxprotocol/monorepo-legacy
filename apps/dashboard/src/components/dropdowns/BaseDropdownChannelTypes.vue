<template>
    <b-dropdown variant="link" class="dropdown-select bg-white">
        <template #button-content>
            <div v-if="platform">
                <img :src="platform.logoURI" v-if="platform.logoURI" width="20" class="mr-2" :alt="platform.name" />
                {{ platform.name }}
            </div>
        </template>
        <b-dropdown-item-button :key="p.type" v-for="p of platformList" @click="$emit('selected', p)">
            <img :src="p.logoURI" v-if="p.logoURI" width="20" class="mr-3" :alt="p.name" />
            {{ p.name }}
        </b-dropdown-item-button>
    </b-dropdown>
</template>

<script lang="ts">
import { platformList, IChannel } from '@thxnetwork/dashboard/types/rewards';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownChannelTypes extends Vue {
    platformList = platformList;

    @Prop({ default: () => platformList[0] }) platform!: IChannel;
}
</script>
