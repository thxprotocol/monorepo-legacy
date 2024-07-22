<template>
    <section class="mt-5 card-contact">
        <div class="container">
            <div class="row">
                <div
                    class="card-header col-lg-5 img-contact"
                    v-lazy:background-image="require('../../public/assets/img/thx_contact_team.webp')"
                ></div>
                <div
                    class="col-lg-7 text-center text-lg-left"
                    :class="{ 'bg-before-dark-contact': dark, 'text-white': !dark }"
                >
                    <div class="row">
                        <div class="col-lg-7 offset-lg-2 pt-4 pb-5 pb-lg-0">
                            <h2 class="h1 mt-3 mt-lg-5">Contact</h2>
                            <p class="my-4">We're happy to help. Contact us with any questions regarding THX.</p>
                            <b-button
                                block
                                :variant="dark ? 'dark' : 'light'"
                                class="rounded-pill d-md-inline"
                                to="/contact"
                                :title="TITLES.CONTACT_US"
                            >
                                Contact us
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row bg-yellow">
                <div class="col-lg-5 order-1 order-lg-0">
                    <div class="row">
                        <div class="col-lg-6 offset-lg-3 p-3 pb-5 pt-5 p-lg-0 pt-lg-5">
                            <h3 class="text-dark mb-3">Company Details</h3>
                            <p>
                                Keizersgracht 482 <br />
                                1017 EG <br />
                                Amsterdam
                            </p>
                            <hr class="mt-4 mb-4" />
                            <ul class="list-unstyled">
                                <li class="pb-2">
                                    <span class="btn-icon bg-dark rounded-circle text-secondary m-0 mr-3">
                                        <i class="fa fa-envelope"></i>
                                    </span>
                                    <a
                                        href="mailto:info@thx.network"
                                        target="_blank"
                                        class="text-dark font-weight-bold"
                                    >
                                        info@thx.network
                                    </a>
                                </li>
                                <li class="pb-2">
                                    <span class="btn-icon bg-dark rounded-circle text-secondary m-0 mr-3">
                                        <i class="fas fa-comments"></i>
                                    </span>
                                    <a
                                        href="https://discord.com/invite/u3DruB5pm5"
                                        target="_blank"
                                        class="text-dark font-weight-bold"
                                    >
                                        Ask us anything on Discord
                                    </a>
                                </li>
                            </ul>
                            <hr />
                            <h3 class="text-dark mb-3">Legal</h3>
                            <ul class="list list-unstyled">
                                <li>
                                    <a
                                        class="text-dark"
                                        target="_blank"
                                        href="https://thx.network/general-terms-and-conditions.pdf"
                                    >
                                        Terms &amp; Conditions
                                        <i class="small ml-2 fas fa-chevron-right"></i>
                                    </a>
                                </li>
                                <li>
                                    <a class="text-dark" target="_blank" href="https://thx.network/privacy-policy.pdf">
                                        Privacy Statement
                                        <i class="small ml-2 fas fa-chevron-right"></i>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-lg-7 order-0 order-lg-1 bg-darker" style="border-bottom-left-radius: 10px">
                    <div class="row">
                        <div class="col-lg-7 offset-lg-2 p-3 pb-5 pt-5 p-lg-0 pt-lg-5">
                            <h3>Press releases &amp; News</h3>
                            <ul class="list-disc">
                                <li>
                                    <a
                                        href="https://medium.com/thxprotocol/researching-a-reputation-system-for-online-communities-52475bdf91b6?source=friends_link&sk=ef515f638e0b558f11fc2f458ebbcdd4"
                                        >Researching a Reputation System for Online Social Communities</a
                                    >
                                </li>
                                <li>
                                    <a
                                        href="https://medium.com/thxprotocol/presenting-the-slack-app-402911645d27?source=friends_link&sk=23d7d770021621f5dc023aa8b379d0f3"
                                        >Presenting the Slack app</a
                                    >
                                </li>
                                <li>
                                    <a href="https://www.getopensocial.com/blog/news-room/gamification-is-dead"
                                        >Gamification 3.0 is here</a
                                    >
                                </li>
                                <li>
                                    <a href="https://www.getopensocial.com/blog/product-center/thx-visual-prototype"
                                        >Visual Prototype of the THX Reward Gamification</a
                                    >
                                </li>
                                <li>
                                    <a
                                        href="https://www.frankwatching.com/archive/2019/01/13/crypto-voor-communities-lost-digitaal-geld-de-grootste-uitdagingen-op/"
                                    >
                                        Crypto for communities: does digital money solve the biggests challenges?</a
                                    >
                                </li>
                            </ul>
                            <h3 class="mt-5">Want to see THX in action?</h3>
                            <b-button
                                variant="outline-secondary rounded-pill"
                                class="mt-3 rounder-pill"
                                href="https://calendly.com/mieszko/demo"
                                target="_blank"
                                :title="TITLES.SCHEDULE_A_DEMO"
                            >
                                Schedule a demo
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row bg-yellow pt-5 pb-5">
                <div class="col-lg-7 offset-lg-5 d-block d-md-flex">
                    <h3 class="flex-grow-1 d-lg-flex align-items-center text-dark m-0 text-center text-lg-left">
                        Join our community online
                    </h3>
                    <div class="align-items-center text-center pt-3 pt-lg-0">
                        <b-button
                            variant="dark"
                            class="btn-icon rounded-circle text-secondary"
                            href="https://discord.com/invite/thx-network-836147176270856243"
                        >
                            <i class="fab fa-discord"></i>
                        </b-button>
                        <b-button
                            variant="dark"
                            class="btn-icon rounded-circle text-secondary"
                            href="https://github.com/thxprotocol"
                        >
                            <i class="fab fa-github"></i>
                        </b-button>
                        <b-button
                            variant="dark"
                            class="btn-icon rounded-circle text-secondary"
                            href="https://twitter.com/thxprotocol"
                        >
                            <i class="fab fa-twitter"></i>
                        </b-button>
                        <b-button
                            variant="dark"
                            class="btn-icon rounded-circle text-secondary"
                            href="https://www.linkedin.com/company/thxprotocol/"
                        >
                            <i class="fab fa-linkedin-in"></i>
                        </b-button>
                        <b-button
                            variant="dark"
                            class="btn-icon rounded-circle text-secondary"
                            href="https://medium.com/thxprotocol"
                        >
                            <i class="fab fa-medium-m"></i>
                        </b-button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TITLES } from '@thxnetwork/public/utils/constants';

@Component
export default class BaseContact extends Vue {
    TITLES = TITLES;
    @Prop() dark!: boolean;
}
</script>

<style scoped>
.img-contact {
    background-repeat: no-repeat;
    background-position: top right;
    background-size: cover;
}
</style>
