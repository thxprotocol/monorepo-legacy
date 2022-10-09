<template>
  <b-dropdown
    size="sm"
    variant="darker"
    no-caret
    toggle-class="d-flex align-items-center"
    v-if="profile"
  >
    <template #button-content>
      <base-identicon
        :size="32"
        :rounded="true"
        :uri="`https://avatars.dicebear.com/api/identicon/${profile.id}.svg`"
        class="p-1 mr-md-2"
      />
      <span class="d-none d-md-block text-muted text-overflow-75">
        {{ address }}
      </span>
    </template>
    <b-dropdown-item
      size="sm"
      variant="dark"
      v-clipboard:copy="profile.address"
    >
      <span class="text-muted">
        <i class="fas fa-clipboard mr-3"></i> Copy address
      </span>
    </b-dropdown-item>
    <b-dropdown-item to="/account">
      <span class="text-muted"
        ><i class="fas fa-user-circle mr-3"></i>Account</span
      >
    </b-dropdown-item>
    <b-dropdown-item :href="dashboardUrl">
      <span class="text-muted"
        ><i class="fas fa-chart-line mr-3"></i>Go to Dashboard</span
      >
    </b-dropdown-item>
    <b-dropdown-divider />
    <b-dropdown-item size="sm" variant="dark" to="/signout">
      <span class="text-muted"
        ><i class="fas fa-sign-out-alt mr-3"></i>Logout</span
      >
    </b-dropdown-item>
  </b-dropdown>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { DASHBOARD_URL } from '@thxnetwork/wallet/utils/secrets';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import BaseIdenticon from './BaseIdenticon.vue';

@Component({
  components: {
    BaseIdenticon,
  },
  computed: {
    ...mapState('network', ['address']),
    ...mapGetters({
      profile: 'account/profile',
    }),
  },
})
export default class BaseDropdownAccount extends Vue {
  address!: string;
  profile!: UserProfile;
  dashboardUrl = DASHBOARD_URL;
}
</script>
