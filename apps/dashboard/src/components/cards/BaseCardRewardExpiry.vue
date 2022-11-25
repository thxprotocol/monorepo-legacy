<template>
    <b-card body-class="bg-light p-0">
        <div class="d-flex align-items-center justify-content-between">
            <strong class="pl-3">Expiration</strong>
            <b-button variant="light" v-b-toggle.collapse-card-expiry>
                <i :class="`fa-chevron-${visible ? 'up' : 'down'}`" class="fas m-0"></i>
            </b-button>
        </div>
        <b-collapse id="collapse-card-expiry" v-model="visible">
            <hr class="mt-0" />
            <div class="px-3">
                <p class="text-gray">
                    Configure until what date and time your customers are allowed to claim this reward. You can also
                    provide a limit to determine the max amount of rewards available.
                </p>
                <b-form-group>
                    <b-row>
                        <b-col md="6">
                            <b-datepicker value-as-date :min="minDate" v-model="expireDate" />
                        </b-col>
                        <b-col md="6">
                            <b-timepicker :disabled="!expireDate" v-model="expireTime" />
                        </b-col>
                    </b-row>
                </b-form-group>
                <b-form-group label="Reward Limit">
                    <b-form-input type="number" v-model="withdrawLimit" />
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCardRewardCondition extends Vue {
    visible = false;
    expireDate: Date | null = null;
    expireTime = '00:00:00';
    withdrawLimit = 0;

    @Prop({ required: false }) rewardExpiry!: { date: Date | null; time: string; limit: number };

    mounted() {
        if (this.rewardExpiry) {
            this.expireDate = this.rewardExpiry.date;
            this.expireTime = this.rewardExpiry.time;
            this.withdrawLimit = this.rewardExpiry.limit;
        }
    }

    get minDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }

    change() {
        this.$emit('change', {
            date: this.expireDate,
            time: this.expireTime,
            limit: this.withdrawLimit,
        });
    }
}
</script>
