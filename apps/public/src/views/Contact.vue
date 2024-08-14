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
                            <div class="d-md-inline">Get Your Preview!</div>
                        </h3>
                        <p class="text-muted">
                            Get a pre-configured campaign tailored to your brand within three business days.
                        </p>
                        <form
                            action="https://docs.google.com/forms/u/0/d/e/1FAIpQLSeTY5A4go_fLkEy8-EdT6i7HV6xtoGDbyy1SBGm-GGFtuC_lw/formResponse"
                        >
                            <b-alert show variant="success" v-if="success"> {{ success }} </b-alert>
                            <b-alert show variant="danger" class="mt-5" v-if="error">
                                {{ error }}
                                Try reaching us on
                                <a href="https://discord.gg/TzbbSmkE7Y" target="_blank">Discord</a>!
                            </b-alert>
                            <b-form-group label="Name" label-class="text-light font-weight-bold">
                                <validation-provider name="Name" :rules="{ required: true }" v-slot="validationContext">
                                    <b-form-input
                                        v-model="name"
                                        name="entry.952186265"
                                        placeholder="Your name"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>
                                        {{ validationContext.errors[0] }}
                                    </b-form-invalid-feedback>
                                </validation-provider>
                            </b-form-group>

                            <b-form-group label="E-mail" label-class="text-light font-weight-bold">
                                <validation-provider
                                    name="E-mail"
                                    :rules="{ required: true, email: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-input
                                        v-model="email"
                                        name="entry.1258733690"
                                        placeholder="Your e-mail address"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>
                            </b-form-group>

                            <b-form-group label="Website" label-class="text-light font-weight-bold">
                                <validation-provider
                                    name="Website"
                                    :rules="{ required: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-input
                                        v-model="website"
                                        name="entry.1688977124"
                                        label="Website"
                                        placeholder="Your projects website URL"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>
                            </b-form-group>

                            <b-form-group label="Campaign Goals" label-class="text-light font-weight-bold">
                                <validation-provider
                                    name="Campaign Goals"
                                    :rules="{ required: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-textarea
                                        v-model="campaignGoals"
                                        name="entry.1923278200"
                                        placeholder="What do you aim to achieve?"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    ></b-form-textarea>
                                    <b-form-invalid-feedback>{{ validationContext.errors[0] }}</b-form-invalid-feedback>
                                </validation-provider>
                            </b-form-group>

                            <b-form-group label="Start Date" label-class="text-light font-weight-bold">
                                <validation-provider
                                    name="Start Date"
                                    :rules="{ required: true }"
                                    v-slot="validationContext"
                                >
                                    <b-form-input
                                        v-model="startDate"
                                        label="Start Date"
                                        type="date"
                                        placeholder="Your potential campaign start date"
                                        class="form-control-underlined"
                                        :state="getValidationState(validationContext)"
                                    />
                                    <b-form-invalid-feedback>
                                        {{ validationContext.errors[0] }}
                                    </b-form-invalid-feedback>
                                    <input
                                        hidden
                                        name="entry.619327791_year"
                                        :value="new Date(startDate).getFullYear()"
                                    />
                                    <input
                                        hidden
                                        name="entry.619327791_month"
                                        :value="new Date(startDate).getMonth()"
                                    />
                                    <input hidden name="entry.619327791_day" :value="new Date(startDate).getDate()" />
                                </validation-provider>
                            </b-form-group>
                            <hr />
                            <b-button block variant="primary" class="rounded-pill" type="submit">
                                Get Your Preview
                                <i class="fas fa-chevron-right"></i>
                            </b-button>
                        </form>
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
import { CONTACT_TAGS, TWITTER_TAGS, LINKS, TITLES } from '@thxnetwork/public/utils/constants';
import { GOOGLE_SITE_KEY } from '../config/secrets';

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
    isLoading = false;
    error = '';
    success = '';

    name = '';
    email = '';
    website = '';
    campaignGoals = '';
    startDate = new Date().toISOString().split('T')[0];

    getValidationState({ dirty, validated, valid = null }: any) {
        return dirty || validated ? valid : null;
    }
}
</script>
