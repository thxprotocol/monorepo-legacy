<template>
    <b-dropdown variant="link" class="dropdown-select bg-white">
        <template #button-content>
            <div v-if="channel">
                <img :src="channel.logoURI" v-if="channel.logoURI" width="20" class="mr-2" :alt="channel.name" />
                {{ channel.name }}
            </div>
        </template>
        <b-dropdown-item-button :key="channel.type" v-for="channel of channelList" @click="$emit('selected', channel)">
            <img :src="channel.logoURI" v-if="channel.logoURI" width="20" class="mr-3" :alt="channel.name" />
            {{ channel.name }}
        </b-dropdown-item-button>
    </b-dropdown>
</template>

<script lang="ts">
import { channelList, IChannel } from '@thxnetwork/dashboard/types/rewards';
import { BDropdown, BDropdownItemButton, BBadge, BSpinner } from 'bootstrap-vue';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BBadge,
        BDropdown,
        BDropdownItemButton,
        BSpinner,
    },
    computed: mapGetters({}),
})
export default class BaseDropdownChannelTypes extends Vue {
    channelList = channelList;

    @Prop() channel!: IChannel;

    mounted() {
        this.$emit('selected', this.channel ? this.channel : this.channelList[0]);
    }
}
</script>
