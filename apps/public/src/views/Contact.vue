<template>
    <section class="bg-secondary bg-bubble pt-5 pb-5 pb-lg-10">
        <div class="container">
            <div class="row pb-5 pt-5 mt-5">
                <div class="col-md-12 text-center">
                    <div class="lead">How can we help you?</div>
                    <h1 class="h1 font-size-xl mt-3 mb-3 text-uppercase">Contact</h1>
                </div>
            </div>
            <div class="row pt-5">
                <div class="col-lg-6">
                    <b-card bg-variant="darker" body-class="p-5" class="mb-5">
                        <h3>
                            <div class="d-md-inline">Want to see THX in action?</div>
                            <b-button
                                variant="outline-secondary"
                                class="rounded-pill float-md-right mt-5 mt-md-0"
                                href="https://calendly.com/mieszko/demo"
                                target="_blank"
                                :title="TITLES.SCHEDULE_A_DEMO"
                            >
                                Schedule a demo
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </h3>
                        <div class="d-flex align-items-center justify-content-center p-3" v-if="loading">
                            <b-spinner variant="dark"></b-spinner>
                        </div>
                        <validation-observer v-else ref="observer" v-slot="{ handleSubmit }">
                            <b-alert show variant="success" v-if="success"> {{ success }} </b-alert>
                            <b-form @submit.stop.prevent="handleSubmit(submit)" id="formContact">
                                <b-alert show variant="danger" class="mt-5" v-if="error">
                                    {{ error }}
                                    Try reaching us on
                                    <a href="https://discord.gg/TzbbSmkE7Y" target="_blank">Discord</a>!
                                </b-alert>
                                <label class="text-light font-weight-bold mt-5">Name</label>
                                <div class="form-group row">
                                    <div class="col-sm-6">
                                        <validation-provider
                                            name="First name"
                                            :rules="{ required: true }"
                                            v-slot="validationContext"
                                        >
                                            <b-form-input
                                                v-model="firstName"
                                                placeholder="First name"
                                                label="First name"
                                                class="form-control-underlined"
                                                :state="getValidationState(validationContext)"
                                            />
                                            <b-form-invalid-feedback>{{
                                                validationContext.errors[0]
                                            }}</b-form-invalid-feedback>
                                        </validation-provider>
                                    </div>
                                    <div class="col-sm-6">
                                        <validation-provider
                                            name="Last name"
                                            :rules="{ required: true }"
                                            v-slot="validationContext"
                                        >
                                            <b-form-input
                                                v-model="lastName"
                                                label="Last name"
                                                class="form-control-underlined"
                                                placeholder="Last name"
                                                :state="getValidationState(validationContext)"
                                            />
                                            <b-form-invalid-feedback>{{
                                                validationContext.errors[0]
                                            }}</b-form-invalid-feedback>
                                        </validation-provider>
                                    </div>
                                </div>
                                <label class="text-light font-weight-bold mt-5">Email</label>

                                <validation-provider
                                    name="E-mail"
                                    :rules="{ required: true, email: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-input
                                        v-model="email"
                                        label="E-mail"
                                        placeholder="Your e-mail address"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>

                                <label class="text-light font-weight-bold mt-5">Phone</label>

                                <validation-provider
                                    name="Phone"
                                    :rules="{ required: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-input
                                        v-model="phone"
                                        label="Phone"
                                        placeholder="Your phone number"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>

                                <label class="text-light font-weight-bold mt-5">Message</label>
                                <validation-provider
                                    name="Message"
                                    :rules="{ required: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-textarea
                                        v-model="message"
                                        label="Message"
                                        placeholder="How can we help you?"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    ></b-form-textarea>
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>
                            </b-form>
                        </validation-observer>
                        <hr />
                        <b-button variant="light" class="rounded-pill" type="submit" form="formContact">
                            Send you message
                            <i class="fas fa-chevron-right"></i>
                        </b-button>
                    </b-card>
                </div>
                <div class="offset-lg-1 col-lg-3">
                    <h3 class="text-dark mb-3">Company Details</h3>
                    <p>
                        THX Network <br />
                        Keizersgracht 482<br />
                        1017 EG, Amsterdam
                    </p>
                    <ul class="list-unstyled mt-5 mb-5">
                        <li class="pb-2">
                            <span class="btn-icon bg-dark rounded-circle text-secondary m-0 mr-3">
                                <i class="fa fa-envelope"></i>
                            </span>
                            <a href="mailto:info@thx.network" target="_blank" class="text-dark font-weight-bold">
                                info@thx.network
                            </a>
                        </li>
                        <li class="pb-2">
                            <span class="btn-icon bg-dark rounded-circle text-secondary m-0 mr-3">
                                <i class="fas fa-comments"></i>
                            </span>
                            <a
                                href="https://discord.gg/thx-network-836147176270856243"
                                target="_blank"
                                class="text-dark font-weight-bold"
                            >
                                Ask us anything on Discord
                            </a>
                        </li>
                    </ul>
                    <img
                        class="img-fluid rounded mb-5"
                        v-lazy="require('../../public/assets/img/thx_contact_team.webp')"
                        alt=""
                    />

                    <h3 class="text-dark">Media Materials</h3>
                    <p class="mb-3">
                        Download and share THX press materials or reach out to our press contact
                        <a class="text-dark font-weight-bold" href="mailto:info@thx.network">Jorrit Horstman</a>.
                    </p>
                    <b-button
                        target="_blank"
                        class="btn btn-outline-dark rounded-pill text-decoration-none"
                        href="https://drive.google.com/drive/folders/1a3cc5mekZfJuHHxRbAc9vQ-DORMFHvG9?usp=sharing"
                    >
                        Download press pack
                        <i class="fas fa-chevron-right"></i>
                    </b-button>

                    <div class="d-flex align-items-center justify-content-around text-center pt-5">
                        <b-button
                            variant="dark"
                            class="btn-icon rounded-circle text-secondary ml-0"
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
                            class="btn-icon rounded-circle text-secondary mr-0"
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
import { Component, Vue } from 'vue-property-decorator';
import axios from 'axios';
import { CONTACT_TAGS, TWITTER_TAGS, LINKS, TITLES } from '@thxnetwork/public/utils/constants';
import { GOOGLE_SITE_KEY, CMS_URL } from '../config/secrets';

@Component({
    metaInfo: {
        title: CONTACT_TAGS.TITLE,
        meta: [
            { name: 'title', content: CONTACT_TAGS.TITLE },
            { name: 'description', content: CONTACT_TAGS.DESCRIPTION },
            { name: 'keywords', content: CONTACT_TAGS.KEYWORDS },
            { name: 'twitter:card', content: TWITTER_TAGS.TWITTER_CARD },
            { name: 'twitter:site', content: TWITTER_TAGS.TWITTER_SITE },
            { name: 'twitter:creator', content: TWITTER_TAGS.TWITTER_CREATOR },
            { name: 'twitter:title', content: CONTACT_TAGS.TITLE },
            { name: 'twitter:description', content: CONTACT_TAGS.DESCRIPTION },
            { name: 'twitter:image:alt', content: CONTACT_TAGS.TITLE },
            { property: 'og:title', content: CONTACT_TAGS.TITLE },
            { property: 'og:description', content: CONTACT_TAGS.DESCRIPTION },
            { property: 'og:type', content: CONTACT_TAGS.OG_TYPE },
            { property: 'og:site_name', content: CONTACT_TAGS.OG_SITE_NAME },
            { property: 'og:url', content: CONTACT_TAGS.OG_URL },
        ],
        link: [{ rel: 'canonical', href: LINKS.CONTACT }],
    },
    components: {},
})
export default class Contact extends Vue {
    TITLES = TITLES;
    googleSiteKey = GOOGLE_SITE_KEY;
    loading = false;
    error = '';
    success = '';

    firstName = '';
    lastName = '';
    email = '';
    phone = '';
    message = '';

    getValidationState({ dirty, validated, valid = null }: any) {
        return dirty || validated ? valid : null;
    }

    async submit() {
        this.loading = true;

        try {
            await axios({
                url: CMS_URL + '/form-contacts',
                method: 'POST',
                data: {
                    email: this.email,
                    firstName: this.firstName,
                    lastName: this.lastName,
                    phone: this.phone,
                    message: this.message,
                },
            });
            this.email = '';
            this.firstName = '';
            this.lastName = '';
            this.phone = '';
            this.message = '';

            this.success = 'THX! We will respond to your message as soon as possible.';
        } catch (e) {
            this.error = 'Oops! Something went wrong...';
        } finally {
            this.loading = false;
        }
        return;
    }
}
</script>
