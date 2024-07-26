<template>
    <div class="d-flex align-items-center bg-dark h-100">
        <BaseCardLogin />
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseCardLogin from '@thxnetwork/dashboard/components/cards/BaseCardLogin.vue';

@Component({
    components: {
        BaseCardLogin,
    },
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class App extends Vue {
    account!: TAccount;
}
</script>
