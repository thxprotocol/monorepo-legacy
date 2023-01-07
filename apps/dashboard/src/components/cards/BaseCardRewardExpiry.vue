<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-expiry
        >
            <strong>Expiry &amp; limit</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-expiry" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <p class="text-gray">
                    Configure until what date and time your customers are allowed for this claim. You can also provide a
                    limit to determine the max amount of claims to be made.
                </p>
                <b-form-group>
                    <b-row>
                        <b-col md="6">
                            <b-datepicker
                                disabled
                                value-as-date
                                :min="minDate"
                                :value="expirationDate"
                                @change="onChangeDate"
                            />
                        </b-col>
                        <b-col md="6">
                            <b-timepicker disabled :value="expirationTime" @change="onChangeTime" />
                            <!-- <b-timepicker
                                :disabled="!expirationDate"
                                :value="expirationTime"
                                @change="onChangeTime"
                            /> -->
                        </b-col>
                    </b-row>
                </b-form-group>
                <b-form-group label="Claim Limit">
                    <b-form-input @change="$emit('change-limit', $event)" type="number" :value="selectedRewardLimit" />
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCardRewardCondition extends Vue {
    isVisible = false;
    expirationDate: Date | null = null;
    expirationTime = '00:00:00';
    selectedRewardLimit = 0;

    @Prop() expiryDate!: Date;
    @Prop() rewardLimit!: number;

    mounted() {
        if (this.expiryDate) {
            const date = new Date(this.expiryDate);
            this.expirationDate = date;
            this.expirationTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        }
    }

    get minDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }

    onChangeDate() {
        this.$emit('change-date', this.expirationDate);
    }

    onChangeTime() {
        if (!this.expirationDate) return;

        this.$emit('change-date', new Date(this.expirationDate).setTime(Number(this.expirationTime)));
    }
}
</script>
