<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-expiry
        >
            <strong>Expiration</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-expiry" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <p class="text-gray">Configure until what date and time your customers are allowed for this claim.</p>
                <b-form-group>
                    <b-row>
                        <b-col md="6">
                            <b-datepicker
                                :date-format-options="{
                                    year: 'numeric',
                                    month: 'short',
                                    day: '2-digit',
                                    weekday: 'short',
                                }"
                                value-as-date
                                :min="minDate"
                                :value="expirationDate"
                                @input="onChangeDate"
                            />
                        </b-col>
                        <b-col md="6">
                            <b-timepicker :disabled="!expirationDate" :value="expirationTime" @input="onChangeTime" />
                        </b-col>
                    </b-row>
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCardRewardExpiry extends Vue {
    isVisible = false;
    expirationDate: Date | null = null;
    expirationTime = '00:00:00';

    @Prop() expiryDate!: Date;

    mounted() {
        if (this.expiryDate) {
            const date = new Date(this.expiryDate);
            this.expirationDate = date;
            this.expirationTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            this.isVisible = true;
        }
    }

    get minDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }

    onChangeDate(date: Date) {
        this.expirationDate = date;
        this.change();
    }

    onChangeTime(time: string) {
        if (!this.expirationDate) return;
        this.expirationTime = time;
        this.change();
    }

    change() {
        if (!this.expirationDate) return;
        const expiryDate = new Date(this.expirationDate);
        const parts = this.expirationTime.split(':');
        expiryDate.setHours(Number(parts[0]));
        expiryDate.setMinutes(Number(parts[1]));
        expiryDate.setSeconds(Number(parts[2]));
        this.$emit('change-date', expiryDate);
    }
}
</script>
