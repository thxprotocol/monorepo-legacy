<template>
    <section class="pb-5 pt-5">
        <div class="container pb-5 pt-5">
            <div class="row">
                <div class="col-md-12 text-center">
                    <h2 class="h5">Use Cases</h2>
                    <p class="lead h1 text-uppercase">Our added value</p>
                </div>
            </div>
        </div>
        <div class="container pb-5">
            <div class="row pb-5">
                <div class="col-lg-12">
                    <hooper class="hooper-use-cases" :settings="hooperSettings">
                        <slide>
                            <b-card class="border-0">
                                <router-link
                                    :to="'/use-cases/onboard-new-players-with-referrals'"
                                    :title="TITLES.HOME_USECASE_ROCKET"
                                >
                                    <img
                                        class="img-fluid rounded"
                                        v-lazy="require('../../public/assets/img/thx_usecase_rocket.webp')"
                                        :alt="ALT_TEXT.USECASES_USECASE_ROCKET"
                                    />
                                </router-link>
                                <div class="mt-5">Gamification</div>
                                <h3 class="h3 text-dark mt-2 font-size-l font-weight-normal">
                                    <router-link
                                        :to="'/use-cases/onboard-new-players-with-referrals'"
                                        :title="TITLES.HOME_USECASE_ROCKET"
                                    >
                                        Onboard new players with referrals
                                    </router-link>
                                </h3>
                                <b-button
                                    variant="link-primary text-primary pl-0"
                                    to="/use-cases/onboard-new-players-with-referrals"
                                >
                                    Discover more
                                    <i class="fas fa-chevron-right"></i>
                                </b-button>
                            </b-card>
                        </slide>
                        <slide>
                            <b-card class="border-0">
                                <router-link
                                    to="/use-cases/next-generation-growth-hack-for-web3-companies"
                                    :title="TITLES.HOME_USECASE_ERC"
                                >
                                    <img
                                        class="img-fluid rounded"
                                        v-lazy="require('../../public/assets/img/thx_usecase_award.webp')"
                                        :alt="ALT_TEXT.USECASES_USECASE_BRAIN"
                                    />
                                </router-link>
                                <div class="mt-5">Web3</div>
                                <h3 class="h3 text-dark mt-2 font-size-l font-weight-normal">
                                    <router-link
                                        to="/use-cases/next-generation-growth-hack-for-web3-companies"
                                        :title="TITLES.HOME_USECASE_ERC"
                                    >
                                        The next generation growth hack for web3 companies
                                    </router-link>
                                </h3>
                                <b-button
                                    variant="link-primary text-primary pl-0"
                                    to="/use-cases/next-generation-growth-hack-for-web3-companies"
                                >
                                    Discover more
                                    <i class="fas fa-chevron-right"></i>
                                </b-button>
                            </b-card>
                        </slide>
                        <slide>
                            <b-card class="border-0">
                                <router-link
                                    :to="'/use-cases/boost-your-sales-and-turn-customers-into-community-members'"
                                    :title="TITLES.HOME_USECASE_REWARD"
                                >
                                    <img
                                        class="img-fluid rounded"
                                        v-lazy="require('../../public/assets/img/thx_usecase_brain.webp')"
                                        :alt="ALT_TEXT.USECASES_USECASE_AWARD"
                                    />
                                </router-link>
                                <div class="mt-5">Engagement</div>
                                <h3 class="h3 text-dark mt-2 font-size-l font-weight-normal">
                                    <router-link
                                        :to="'/use-cases/boost-your-sales-and-turn-customers-into-community-members'"
                                        :title="TITLES.HOME_USECASE_REWARD"
                                    >
                                        Boost your sales and turn customers into community members
                                    </router-link>
                                </h3>
                                <b-button
                                    variant="link-primary text-primary pl-0"
                                    to="/use-cases/boost-your-sales-and-turn-customers-into-community-members"
                                >
                                    Discover more
                                    <i class="fas fa-chevron-right"></i>
                                </b-button>
                            </b-card>
                        </slide>
                        <slide>
                            <b-card class="border-0">
                                <router-link
                                    :to="'/use-cases/money-management-for-groups-of-people'"
                                    :title="TITLES.HOME_USECASE_MONEY"
                                >
                                    <img
                                        class="img-fluid rounded"
                                        v-lazy="require('../../public/assets/img/thx_usecase_crater.webp')"
                                        :alt="ALT_TEXT.USECASES_USECASE_CRATER"
                                    />
                                </router-link>
                                <div class="mt-5">Financial</div>
                                <h3 class="h3 text-dark mt-2 font-size-l font-weight-normal">
                                    <router-link
                                        :to="'/use-cases/money-management-for-groups-of-people'"
                                        :title="TITLES.HOME_USECASE_MONEY"
                                    >
                                        Money management for groups of people
                                    </router-link>
                                </h3>
                                <b-button
                                    variant="link-primary text-primary pl-0"
                                    to="/use-cases/money-management-for-groups-of-people"
                                >
                                    Discover more
                                    <i class="fas fa-chevron-right"></i>
                                </b-button>
                            </b-card>
                        </slide>

                        <hooper-pagination slot="hooper-addons"></hooper-pagination>
                    </hooper>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { BButton } from 'bootstrap-vue';
import { Component, Vue } from 'vue-property-decorator';
import { Hooper, Slide, Pagination as HooperPagination } from 'hooper';
import 'hooper/dist/hooper.css';
import { ALT_TEXT, TITLES } from '@thxnetwork/public/utils/constants';

@Component({
    components: {
        'b-button': BButton,
        'hooper': Hooper,
        'slide': Slide,
        'hooper-pagination': HooperPagination,
    },
})
export default class BaseUseCases extends Vue {
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;

    get hooperSettings() {
        const getWidth = () => window.innerWidth;
        return {
            infiniteScroll: false,
            itemsToShow: getWidth() > 960 ? 2.5 : 1,
            centerMode: false,
        };
    }
}
</script>
<style lang="scss" scoped>
.col-md-7 {
    .screen {
        margin-bottom: 3rem;
    }
    @media (min-width: 768px) {
        position: absolute;
        top: -140px;

        .screen {
            margin-bottom: 1rem;
        }
    }
}

h3.mt-2.font-size-l.font-weight-normal {
    a {
        color: black;

        &:hover {
            text-decoration: none;
        }
    }
}
</style>
