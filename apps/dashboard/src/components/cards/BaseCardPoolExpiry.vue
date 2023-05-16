<template>
    <b-form-group label="End date" description="Configure until what date and time the campaign will run.">
        <b-row>
            <b-col md="6">
                <b-datepicker value-as-date :min="minDate" :value="expirationDate" @input="onChangeDate" />
            </b-col>
            <b-col md="6">
                <b-timepicker :disabled="!expirationDate" :value="expirationTime" @input="onChangeTime" />
            </b-col>
        </b-row>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCardPoolExpiry extends Vue {
    isVisible = false;
    expirationDate: Date | null = null;
    expirationTime = '00:00:00';

    @Prop() endDate!: Date;

    mounted() {
        if (this.endDate) {
            const date = new Date(this.endDate);
            this.expirationDate = date;
            this.expirationTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
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
        const endDate = new Date(this.expirationDate);
        const parts = this.expirationTime.split(':');
        endDate.setHours(Number(parts[0]));
        endDate.setMinutes(Number(parts[1]));
        endDate.setSeconds(Number(parts[2]));
        this.$emit('change-date', endDate);
    }
}
</script>
