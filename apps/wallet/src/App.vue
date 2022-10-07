<template>
    <div id="app" class="d-flex flex-column h-100" :class="{ 'dark-mode': isDarkMode }">
        <div class="flex-grow-1 overflow-auto d-flex flex-column">
            <header class="p-md-3 container-fluid d-flex align-items-center" v-if="$router.currentRoute.name">
                <b-button to="/" variant="link" class="pl-0 mr-auto mr-md-0">
                    <img :src="require('../public/assets/img/logo.png')" height="32" alt="" />
                </b-button>
                <base-network-select v-if="profile" />
                <div class="d-none d-md-flex flex-grow-1 justify-content-center ">
                    <base-main-menu v-if="profile" class="mx-auto" />
                </div>
                <b-button size="" class="p-2 px-3 mx-2" @click="toggleDarkMode()" variant="darker">
                    <i class="fas fa-moon ml-0 text-warning" v-if="isDarkMode"></i>
                    <i class="fas fa-sun ml-0 text-warning" v-if="!isDarkMode"></i>
                </b-button>
                <base-dropdown-account />
            </header>
            <div
                class="container container-md d-flex flex-column flex-grow-1 flex-md-grow-0 mt-0 my-md-auto"
                style="max-width: 768px; min-height: 450px"
            >
                <h1 v-if="$router.currentRoute.name" class="display-5 text-secondary">
                    {{ $router.currentRoute.name }}
                </h1>
                <router-view class="main-container flex-grow-1 overflow-auto shadow-lg py-3 p-3 mb-2" />
            </div>
            <footer
                v-if="$router.currentRoute.name"
                class="d-flex align-items-center container flex-shrink-0"
                style="height: 85px"
            >
                <base-main-menu v-if="profile" class="w-100 d-md-none" />
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { UserProfile } from './store/modules/account';
import BaseNetworkSelect from './components/BaseNetworkSelect.vue';
import BaseDropdownAccount from './components/BaseDropdownAccount.vue';
import BaseMainMenu from './components/BaseMainMenu.vue';
import { initGTM } from '@thxnetwork/wallet/utils/gtm';

@Component({
    components: {
        BaseMainMenu,
        BaseNetworkSelect,
        BaseDropdownAccount,
    },
    computed: mapGetters({
        profile: 'account/profile',
    }),
})
export default class App extends Vue {
    isDarkMode = false;
    profile!: UserProfile | null;

    created() {
        initGTM();
        this.isDarkMode = !!JSON.parse(localStorage.getItem('thx:wallet:darkmode') || 'false');
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('thx:wallet:darkmode', String(this.isDarkMode));
    }
}
</script>
