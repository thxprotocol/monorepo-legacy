<template>
    <b-dropdown size="sm" variant="darker" no-caret toggle-class="d-flex align-items-center" v-if="profile">
        <template #button-content>
            <base-identicon
                class="mr-md-2"
                size="32"
                :uri="`https://api.dicebear.com/7.x/identicon/svg?seed=${profile.sub}`"
            />
            <span class="d-none d-md-block text-muted text-overflow-75">
                {{ profile.address }}
            </span>
        </template>
        <b-dropdown-item size="sm" variant="dark" v-clipboard:copy="profile.address">
            <span class="text-muted"><i class="fas fa-clipboard mr-3"></i>Copy address</span>
        </b-dropdown-item>
    </b-dropdown>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIdenticon from '../BaseIdenticon.vue';

@Component({
    components: {
        BaseIdenticon,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class BaseDropdownAccount extends Vue {
    profile!: TAccount;
}
</script>
