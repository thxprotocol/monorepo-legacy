<template>
    <div class="bg-darker">
        <p class="text-center">
            <img
                width="90"
                v-lazy="require('../../../public/assets/img/thx_token_coin.webp')"
                alt="THX coin"
                class="mt-n5"
            />
        </p>
        <div class="container">
            <div class="row pt-5 pb-5">
                <div class="col-lg-8 offset-lg-2 text-center">
                    <h2 class="h5">Token distribution over time</h2>
                    <p class="h2 mb-3 mt-3 text-white">5-Year Circulation Schedule</p>
                    <p class="text-gray">Months since transfers are enabled. Last updated november 10th 2021</p>
                    <ChartCirculationSchedule :chartData="chartData" :options="chartOptions" />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Line as LineComponent } from 'vue-chartjs';
import { Title, Tooltip, Legend, LineElement, LinearScale, CategoryScale, Chart, PointElement } from 'chart.js';
import { read } from 'fs';

Chart.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement, LineElement);

@Component({
    components: { ChartCirculationSchedule: LineComponent },
})
export default class BaseTokenCirculation extends Vue {
    chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    backgroundColor: '#9c9e9f',
                    color: '#9c9e9f',
                    usePointStyle: true,
                    boxWidth: 10,
                    padding: 20,
                },
            },
        },
        scales: {
            grid: {
                color: '#FF0000',
            },
            x: {
                display: true,
                gridLines: {
                    display: true,
                    color: '#9c9e9f',
                },
            },
            y: {
                display: true,
                gridLines: {
                    display: true,
                    color: '#9c9e9f',
                },
            },
        },
    };

    chartData = {
        labels: ["Dec '21", "Jan '22", "Apr '22 ", "May '23", "Dec '23", "Dec '26"],
        datasets: [
            {
                label: 'Liquidity Pool',
                data: [10000000, 10000000, 10000000, 10000000, 10000000, 10000000],
                backgroundColor: 'rgba(133, 114, 219, .1)',
                borderColor: 'rgba(133, 114, 219, 1)',
                pointBackgroundColor: 'rgba(133, 114, 219, 1)',
            },
            {
                label: 'Onboarding',
                data: [
                    null,
                    10000000 + 2500000,
                    10000000 + 2500000,
                    10000000 + 2500000,
                    10000000 + 2500000,
                    10000000 + 2500000,
                ],
                backgroundColor: 'rgba(110, 214, 90, .1)',
                borderColor: 'rgba(110, 214, 90, 1)',
                pointBackgroundColor: 'rgba(110, 214, 90, 1)',
            },
            {
                label: 'Community Distribution',
                data: [
                    null,
                    null,
                    10000000 + 2500000 + 15000000,
                    10000000 + 2500000 + 15000000,
                    10000000 + 2500000 + 15000000,
                    10000000 + 2500000 + 15000000,
                ],
                backgroundColor: 'rgba(25, 115, 233, .1)',
                borderColor: 'rgba(25, 115, 233, 1)',
                pointBackgroundColor: 'rgba(25, 115, 233, 1)',
            },
            {
                label: 'Community Treasury',
                data: [
                    null,
                    null,
                    10000000 + 2500000 + 15000000 + 10000000,
                    10000000 + 2500000 + 15000000 + 10000000,
                    10000000 + 2500000 + 15000000 + 15000000,
                    10000000 + 2500000 + 15000000 + 20000000,
                ],
                backgroundColor: 'rgba(255, 152, 37, .1)',
                borderColor: 'rgba(255, 152, 37, 1)',
                pointBackgroundColor: 'rgba(255, 152, 37, 1)',
            },
            {
                label: 'Community Incentives',
                data: [
                    null,
                    null,
                    10000000 + 2500000 + 15000000 + 10000000 + 10000000,
                    10000000 + 2500000 + 15000000 + 10000000 + 10000000,
                    10000000 + 2500000 + 15000000 + 15000000 + 15000000,
                    10000000 + 2500000 + 15000000 + 20000000 + 20000000,
                ],
                backgroundColor: 'rgba(251, 112, 112, .1)',
                borderColor: 'rgba(251, 112, 112, 1)',
                pointBackgroundColor: 'rgba(251, 112, 112, 1)',
            },
            {
                label: 'Investors',
                data: [
                    null,
                    null,
                    null,
                    10000000 + 2500000 + 15000000 + 10000000 + 10000000 + 15000000,
                    10000000 + 2500000 + 15000000 + 15000000 + 15000000 + 15000000,
                    10000000 + 2500000 + 15000000 + 20000000 + 20000000 + 15000000,
                ],
                backgroundColor: 'rgba(255, 229, 0, .1)',
                borderColor: 'rgba(255, 229, 0,1)',
                pointBackgroundColor: 'rgba(255, 229, 0,1)',
            },
            {
                label: 'Team',
                data: [
                    null,
                    null,
                    null,
                    null,
                    10000000 + 2500000 + 15000000 + 15000000 + 15000000 + 15000000 + 17500000,
                    10000000 + 2500000 + 15000000 + 20000000 + 20000000 + 15000000 + 17500000,
                ],
                backgroundColor: 'rgba(116, 229, 218, .1)',
                borderColor: 'rgba(116, 229, 218, 1)',
                pointBackgroundColor: 'rgba(116, 229, 218, 1)',
            },
        ],
    };
}
</script>
