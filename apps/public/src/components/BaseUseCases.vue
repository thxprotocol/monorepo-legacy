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
                            <BaseSlideUseCase :content="content['titanborn']" />
                        </slide>
                        <slide>
                            <BaseSlideUseCase :content="content['royal-dutch-mint']" />
                        </slide>
                        <slide>
                            <BaseSlideUseCase :content="content['carbify']" />
                        </slide>
                        <slide>
                            <BaseSlideUseCase :content="content['apeswap']" />
                        </slide>
                        <slide>
                            <BaseSlideUseCase :content="content['forest-knight']" />
                        </slide>
                        <slide>
                            <BaseSlideUseCase :content="content['tryhards']" />
                        </slide>
                        <slide>
                            <BaseSlideUseCase :content="content['2tokens']" />
                        </slide>
                        <slide>
                            <BaseSlideUseCase :content="content['blind-boxes']" />
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
import BaseSlideUseCase from '@thxnetwork/public/components/BaseSlideUseCase.vue';
import { content } from '../views/UseCaseDetail.vue';

@Component({
    components: {
        'b-button': BButton,
        'hooper': Hooper,
        'slide': Slide,
        'hooper-pagination': HooperPagination,
        BaseSlideUseCase,
    },
})
export default class BaseUseCases extends Vue {
    content = content;
    ALT_TEXT = ALT_TEXT;
    TITLES = TITLES;
    hooperSettings = {
        infiniteScroll: true,
        itemsToShow: 1,
        centerMode: false,
        breakpoints: {
            960: {
                itemsToShow: 3.5,
            },
        },
    };
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
