<template>
    <section class="pb-5">
        <div class="container pt-5 pb-5">
            <div class="row pt-5 pb-5">
                <div class="col-md-12 text-center">
                    <h2 class="h5">Core Team</h2>
                    <p class="lead h1">Nice to meet you!</p>
                </div>
                <b-row>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/thx_team_mieszko.jpg')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_MIESZKO"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Mieszko Czyzyk</h3>
                                    <small>CEO &amp; Co-founder</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/mieszkoczyzyk/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Serial SaaS founder. Loves data-driven marketing. Into blockchain since 2013.
                            </p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/peter.jpg')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_PETER"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Peter Polman</h3>
                                    <small>CTO &amp; Co-founder</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/peterpolman/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Serial digital product engineer and agile team leader. Very serious about UX.
                            </p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/phillip.png')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_PHILLIP"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Phillip Reidy</h3>
                                    <small>Community Manager</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/phillip-r-7a6991155/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">Community Lead and Blockchain Investor</p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded-circle"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/thx_team_prasanth.jpeg')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_VALERIA"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Prasanth Viswam</h3>
                                    <small>Sales Engineer</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/prasanth-xipher"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">Background in software engineering.</p>
                        </b-card>
                    </b-col>
                </b-row>
            </div>
            <div class="row pt-5 pb-5">
                <div class="col-md-12 text-center">
                    <h2 class="h5">Our Contributors</h2>
                </div>
            </div>
            <div class="pb-5">
                <b-row>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/steffen.jpg')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_STEFFEN"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Steffen Boode</h3>
                                    <small>Co-founder</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/steffen-boode-27601915/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Business developer. Background in VC/M&A. Digital asset enthousiast.
                            </p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/marloes.png')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_MARLOES"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Marloes Pomp</h3>
                                    <small>DAO Advisor</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/marloespomp/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">Digital Economy & AI consultant.</p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/valeria.png')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_VALERIA"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Valeria Grazzini</h3>
                                    <small>Software Developer</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/valeriagrazzini"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Background in back-end engineering now Node.js, GraphQL and Solidity.
                            </p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/jorrit.png')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_JORRIT"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Jorrit Horstman</h3>
                                    <small>Marketing Strategist & Content Creator</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/jorrithorstman"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Prize winning content strategies, 10+ years of international agency experience.
                            </p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/bram.png')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_BRAM"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Bram Rongen</h3>
                                    <small>DevOps Engineer, multisig</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/bramrongen/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">Former CTO of 3D Hubs, now DevOps for hire.</p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/thx_team_natasha.jpg')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_NATASHA"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Natasha Sch&ouml;n</h3>
                                    <small>Writer, Editor</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/natashaschoen/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Part of the 500 most talented under 26 in tech according to TheNextWeb and Accenture.
                            </p>
                        </b-card>
                    </b-col>

                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded-circle"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/thx_team_evert.jpg')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_EVERT"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Evert Kors</h3>
                                    <small>Software Engineer, Multisig holder</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/evert-kors/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Won ETHLondon 2020 and ETHGlobal 2021 hackathon. Smart contract specialist.
                            </p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/thx_team_jule.png')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_JULE"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Jule Landwehr</h3>
                                    <small>MSc - UX Researcher</small>
                                </div>
                                <div>
                                    <a
                                        class="p-1 small bg-dark text-white"
                                        href="https://www.linkedin.com/in/jule-landwehr-388332183/"
                                    >
                                        <i class="fab fa-linkedin-in"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Graduated with honours in Human Factors & Engineering Psychology on the subject of
                                online reputation.
                            </p>
                        </b-card>
                    </b-col>
                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/thx_team_tuan.jpg')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_TUAN"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Tuan Nguyen</h3>
                                    <small>JavaScript Developer</small>
                                </div>
                                <div>
                                    <a class="p-1 small bg-dark text-white" href="https://github.com/GarfDev">
                                        <i class="fab fa-github"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Typescript and Javascript developer. Created our Discord Bot, now Javascript & API.
                            </p>
                        </b-card>
                    </b-col>

                    <b-col md="3" class="p-2">
                        <b-card class="h-100">
                            <div class="d-flex">
                                <div class="pr-4">
                                    <img
                                        class="rounded"
                                        height="65"
                                        v-lazy="require('../../public/assets/img/thx_team_mulenga.png')"
                                        :alt="ALT_TEXT.HOME_BASE_TEAM_MULENGA"
                                    />
                                </div>
                                <div class="d-flex flex-column justify-content-center flex-grow-1">
                                    <h3 class="text-darker m-0">Mulenga</h3>
                                    <small>Developer</small>
                                </div>
                                <div>
                                    <a class="p-1 small bg-dark text-white" href="https://gitcoin.co/mul53">
                                        <i class="fab fa-github"></i>
                                    </a>
                                </div>
                            </div>
                            <hr />
                            <p class="font-italic font-weight-light">
                                Highly rated developer on Gitcoin. Main contributor to the Slack integration.
                            </p>
                        </b-card>
                    </b-col>
                </b-row>
            </div>
        </div>
    </section>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ALT_TEXT } from '@thxnetwork/public/utils/constants';

@Component({})
export default class BaseTeam extends Vue {
    ALT_TEXT = ALT_TEXT;
}
</script>
