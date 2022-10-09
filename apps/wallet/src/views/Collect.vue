<template>
  <div class="d-flex align-items-center justify-content-center bg-dark p-5">
    <div class="flex-row text-white">
      <div v-if="isLoading && !error" class="text-center">
        <b-spinner variant="secondary" large /><br />
        <span class="text-muted mt-2">{{ info }}</span>
      </div>
      <template v-else>
        <template v-if="isClaimInvalid">
          <b-alert show variant="info">
            <i class="fas fa-info-circle mr-2"></i>
            {{ error }}
          </b-alert>
          <b-button block variant="primary" class="rounded-pill" to="/tokens">
            Continue
          </b-button>
        </template>

        <template v-if="isClaimFailed">
          <b-alert show variant="danger">
            Oops, we did not manage to claim your token reward at this time,
            please try again later.
          </b-alert>
          <b-button
            block
            variant="primary"
            class="rounded-pill"
            @click="claimReward()"
          >
            Try again
          </b-button>
        </template>
      </template>

      <template v-if="claim">
        <template v-if="claim.erc20">
          <div
            class="img-treasure"
            :style="`background-image: url(${imgUrl});`"
          ></div>
          <h2 class="text-secondary text-center my-3">
            <strong>Congratulations!</strong> You've earned
            <strong>{{ claim.amount }} {{ claim.erc20.symbol }}</strong>
          </h2>
          <p class="lead text-center">
            Collect, swap or redeem these tokens for promotions.<br />
            <small class="text-muted" v-if="claim.unlockDate">
              Unlocks at
              {{ format(new Date(claim.unlockDate), 'MMMM dd, yyyy') }}
            </small>
          </p>
        </template>
        <b-row v-if="claim.erc721Id">
          <b-col xs="12" md="6" class="d-flex align-items-center">
            <b-img-lazy :src="imgUrl" class="d-block w-100" />
          </b-col>
          <b-col xs="12" md="6">
            <h2 class="text-secondary my-3">
              <strong>Congratulations!</strong> You've claimed an NFT.
            </h2>
            <p class="lead">
              {{ claim.metadata.title || 'title' }}<br />
              <small class="text-muted">{{
                claim.metadata.description ||
                'Lorem ipsum dolor sit amet, nunct copesitas randum.'
              }}</small>
            </p>
          </b-col>
        </b-row>
        <hr />
        <b-button
          class="rounded-pill"
          block
          variant="primary"
          @click="goToWallet"
          type="submit"
        >
          Continue
        </b-button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { ERC721, TERC721Token } from '@thxnetwork/wallet/store/modules/erc721';
import {
  Withdrawal,
  WithdrawalState,
} from '@thxnetwork/wallet/store/modules/withdrawals';
import { AxiosError } from 'axios';
import { format } from 'date-fns';
import { User } from 'oidc-client-ts';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import poll from 'promise-poller';

@Component({
  computed: {
    ...mapState('erc721', ['erc721s']),
    ...mapGetters({
      privateKey: 'account/privateKey',
      profile: 'account/profile',
      user: 'account/user',
      networks: 'network/all',
    }),
  },
})
export default class Collect extends Vue {
  format = format;
  imgUrl = require('@thxnetwork/wallet/../public/assets/img/thx_treasure.png');
  error = '';
  isLoading = true;
  claimStarted = false;
  isClaimFailed = false;
  isClaimInvalid = false;
  claim: (Withdrawal & TERC721Token) | null = null;

  erc721s!: { [id: string]: ERC721 };
  user!: User;

  get erc721() {
    if (!this.claim) return null;
    return this.erc721s[this.claim.erc721Id];
  }

  get info() {
    return this.claimStarted
      ? 'Claim transaction pending...'
      : 'Claiming your reward...';
  }

  mounted() {
    this.claimReward();
  }

  async claimReward() {
    this.isLoading = true;

    if (!this.user) this.$router.push({ path: 'memberships' });

    try {
      const state: any = this.user.state;
      const claim = await this.$store.dispatch('assetpools/claimReward', {
        claimId: state.claimId,
        rewardHash: state.rewardHash,
      });
      this.claimStarted = true;

      if (claim?.erc20) {
        await this.waitForWithdrawn(claim);
      } else {
        await this.waitForMinted(claim);
      }
      this.claim = claim;

      this.startConfetti();

      if (this.claim && this.claim.erc721Id) {
        await this.$store.dispatch(
          'network/connect',
          this.claim.erc721.chainId
        );
        this.$store.commit('erc721/set', this.claim.erc721);

        const imgUrl = this.firstImageURL(this.claim.metadata);
        if (imgUrl) this.imgUrl = imgUrl;
      } else if (this.claim && this.claim.erc20) {
        await this.$store.dispatch('network/connect', this.claim.erc20.chainId);
      }
    } catch (e) {
      const res = (e as AxiosError).response;
      this.isClaimFailed = res?.status === 500;
      this.isClaimInvalid = res?.status === 403;
      if (res?.status === 403) {
        this.error = res?.data.error.message;
      }
    } finally {
      this.claimStarted = false;
      this.isLoading = false;
    }
  }

  async waitForWithdrawn(withdrawal: Withdrawal) {
    const state: any = this.user.state;
    const claim = await this.$store.dispatch('assetpools/getClaim', {
      claimId: state.claimId,
      rewardHash: state.rewardHash,
    });

    const taskFn = async () => {
      const w = await this.$store.dispatch('withdrawals/get', {
        id: withdrawal._id,
        poolId: claim.poolId,
      });
      if (w && w.state === WithdrawalState.Withdrawn) {
        return Promise.resolve(w);
      } else {
        return Promise.reject(w);
      }
    };

    return poll({ taskFn, interval: 3000, retries: 10 });
  }

  async waitForMinted(token: TERC721Token) {
    const taskFn = async () => {
      const t = await this.$store.dispatch('erc721/getToken', token._id);
      if (t && t.state !== 0) {
        return Promise.resolve(t);
      } else {
        return Promise.reject(t);
      }
    };

    return poll({ taskFn, interval: 3000, retries: 10 });
  }

  firstImageURL(metadata: any) {
    let url = '';
    this.erc721?.properties.forEach((p) => {
      if (p.propType === 'image') {
        url = metadata.attributes.find(
          (a: { value: string; key: string }) => a.key === p.name
        ).value;
      }
    });
    return url;
  }

  startConfetti() {
    (this as any).$confetti.start({
      defaultDropRate: 7,
      particlesPerFrame: 1,
      windSpeedMax: 3,
      defaultSize: 7,
    });
  }

  goToWallet() {
    (this as any).$confetti.stop();
    const path = this.erc721 ? 'collectibles' : 'tokens';
    this.$router.push({ path });
  }
}
</script>
<style scoped>
.img-treasure {
  background-size: contain;
  background-repeat: no-repeat;
  min-height: 250px;
  background-position: center center;
}
</style>
