<template>
    <b-form-group>
        <b-row>
            <b-col md="8">
                <b-form-group label="Start Date">
                    <b-input-group>
                        <b-datepicker
                            value-as-date
                            :min="minDate"
                            bg-variant="primary"
                            v-model="startDate"
                            @input="update"
                        />
                        <b-input-group-append>
                            <b-button @click="onClickStartDateReset" variant="dark">
                                <i class="fas fa-trash ml-0"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col md="4">
                <b-form-group label="Time">
                    <b-input-group>
                        <b-timepicker :disabled="!startDate" v-model="startTime" @input="update" />
                        <b-input-group-append>
                            <b-button @click="onClickStartTimeReset" variant="dark">
                                <i class="fas fa-trash ml-0"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col md="8">
                <b-form-group label="End Date">
                    <b-input-group>
                        <b-datepicker value-as-date :min="startDate" v-model="endDate" @input="update" />
                        <b-input-group-append>
                            <b-button @click="onClickEndDateReset" variant="dark">
                                <i class="fas fa-trash ml-0"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
            <b-col md="4">
                <b-form-group label="Time">
                    <b-input-group>
                        <b-timepicker :disabled="!endDate" v-model="endTime" @input="update" />
                        <b-input-group-append>
                            <b-button @click="onClickEndTimeReset" variant="dark">
                                <i class="fas fa-trash ml-0"></i>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
            </b-col>
        </b-row>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

export function parseDateTime(dateString: Date | null, timeString: string) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const parts = timeString.split(':');
    date.setHours(Number(parts[0]));
    date.setMinutes(Number(parts[1]));
    date.setSeconds(Number(parts[2]));
    return date;
}

@Component({})
export default class BaseDateDuration extends Vue {
    isVisible = false;
    startDate: Date | null = null;
    startTime = '00:00:00';
    endDate: Date | null = null;
    endTime = '00:00:00';

    @Prop() settings!: { startDate: Date; endDate: Date };

    mounted() {
        if (this.settings.startDate) {
            this.startDate = new Date(this.settings.startDate);
            this.startTime = `${this.startDate.getHours()}:${this.startDate.getMinutes()}:${this.startDate.getSeconds()}`;
        }

        if (this.settings.endDate) {
            this.endDate = new Date(this.settings.endDate);
            this.endTime = `${this.endDate.getHours()}:${this.endDate.getMinutes()}:${this.endDate.getSeconds()}`;
        }
    }

    get minDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }

    update() {
        this.$emit('update', {
            startDate: this.startDate,
            startTime: this.startTime,
            endDate: this.endDate,
            endTime: this.endTime,
        });
    }

    onClickStartDateReset() {
        this.startDate = null;
        this.startTime = '00:00:00';
        this.update();
    }

    onClickEndDateReset() {
        this.endDate = null;
        this.endTime = '00:00:00';
        this.update();
    }

    onClickStartTimeReset() {
        this.startTime = '00:00:00';
        this.update();
    }

    onClickEndTimeReset() {
        this.endTime = '00:00:00';
        this.update();
    }
}
</script>
