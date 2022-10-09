<template>
  <div id="app">
    <base-navbar />
    <div class="sidebar-sibling">
      <base-dropdown-menu
        v-if="profile"
        class="d-flex d-md-none position-fixed justify-content-end p-2"
        style="right: 0; z-index: 1"
      />
      <router-view />
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IAccount } from './types/account';
import { initGTM } from '@thxnetwork/dashboard/utils/ga';
import BaseDropdownAccount from './components/dropdowns/BaseDropdownAccount.vue';
import BaseNavbar from './components/BaseNavbar.vue';
import BaseDropdownMenu from './components/dropdowns/BaseDropdownMenu.vue';
import { GTM } from '@thxnetwork/dashboard/utils/secrets';

@Component({
  components: {
    BaseDropdownAccount,
    BaseDropdownMenu,
    BaseNavbar,
  },
  computed: mapGetters({
    profile: 'account/profile',
  }),
})
export default class App extends Vue {
  profile!: IAccount;

  created() {
    if (GTM) initGTM();
  }
}
</script>
