<template>
  <div v-if="profile">
    <b-container
      :class="
        loading || !hasTokens
          ? 'd-flex h-100 align-items-center justify-content-center'
          : ''
      "
    >
      <b-spinner v-if="loading" variant="primary" class="m-auto" />
      <strong v-if="!loading && !hasTokens" class="text-gray text-center">
        No tokens are visible for your account.
      </strong>
      <b-row v-if="hasTokens">
        <b-col md="4" :key="key" v-for="(token, key) in tokens">
          <base-card-nft :token="token" />
        </b-col>
      </b-row>
    </b-container>
  </div>
</template>

<script lang="ts">
import BaseCardNft from '@thxnetwork/wallet/components/cards/BaseCardNft.vue';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { TERC721Token } from '@thxnetwork/wallet/store/modules/erc721';

@Component({
  components: {
    BaseCardNft,
  },
  computed: {
    ...mapState('erc721', ['tokens']),
    ...mapGetters({
      profile: 'account/profile',
    }),
  },
})
export default class NFTView extends Vue {
  loading = true;
  profile!: UserProfile;
  tokens!: { [_tokenId: string]: TERC721Token };

  get hasTokens() {
    return Object.values(this.tokens).length;
  }

  mounted() {
    this.$store.dispatch('erc721/list').then(async () => {
      this.loading = false;
    });
  }
}
</script>
