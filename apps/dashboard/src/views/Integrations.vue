<template>
  <div>
    <div class="container-xl">
      <b-jumbotron
        bg-variant="light"
        class="mt-3 jumbotron-header"
        :style="{
          'min-height': 'none',
          'border-radius': '1rem',
          'background-size': 'cover',
          'background-image': `url(${require('../../public/assets/thx_jumbotron.webp')})`,
        }"
      >
        <div class="container container-md py-5">
          <p class="brand-text">Integrations</p>
        </div>
      </b-jumbotron>
    </div>

    <div class="container container-md" v-if="profile">
      <div class="row">
        <div class="col-md-6 col-lg-4">
          <base-integration-youtube />
        </div>
        <div class="col-md-6 col-lg-4">
          <base-integration-twitter />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIntegrationYoutube from '@thxnetwork/dashboard/components/cards/BaseIntegrationYoutube.vue';
import BaseIntegrationTwitter from '@thxnetwork/dashboard/components/cards/BaseIntegrationTwitter.vue';
import { UserProfile } from 'oidc-client-ts';

@Component({
  components: {
    BaseIntegrationYoutube,
    BaseIntegrationTwitter,
  },
  computed: mapGetters({
    profile: 'account/profile',
  }),
})
export default class Home extends Vue {
  profile!: UserProfile;

  mounted() {
    this.$store.dispatch('account/getProfile');
  }
}
</script>
