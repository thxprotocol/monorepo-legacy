<template>
  <div>
    <b-jumbotron
      class="jumbotron-header text-left"
      :style="{
        'background-image': `url(${require('../../public/assets/thx_jumbotron.webp')})`,
      }"
    >
      <div class="container container-md pt-10 pb-5">
        <p class="brand-text">Integrations</p>
        <!-- <p>Connect your social accounts and create automated token rewards for you audience.</p> -->
      </div>
    </b-jumbotron>

    <div class="container container-md" v-if="profile">
      <div class="row">
        <div class="col-md-6 col-lg-4">
          <base-integration-youtube />
        </div>
        <div class="col-md-6 col-lg-4">
          <base-integration-twitter />
        </div>
        <div class="col-md-6 col-lg-4">
          <base-integration-spotify />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseIntegrationYoutube from '@thxprotocol/dashboard/components/cards/BaseIntegrationYoutube.vue';
import BaseIntegrationTwitter from '@thxprotocol/dashboard/components/cards/BaseIntegrationTwitter.vue';
import BaseIntegrationSpotify from '@thxprotocol/dashboard/components/cards/BaseIntegrationSpotify.vue';

@Component({
  components: {
    BaseIntegrationYoutube,
    BaseIntegrationTwitter,
    BaseIntegrationSpotify,
  },
  computed: mapGetters({
    profile: 'account/profile',
  }),
})
export default class Home extends Vue {
  mounted() {
    this.$store.dispatch('account/getProfile');
  }
}
</script>
