<template>
    <Bar
        :chart-options="chartOptions"
        :chart-data="chartData"
        :chart-id="chartId"
        :dataset-id-key="datasetIdKey"
        :plugins="plugins"
        :css-classes="cssClasses"
        :styles="styles"
        :width="width"
        :height="height"
    />
</template>

<script>
import { Bar } from 'vue-chartjs/legacy';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
    name: 'BarChart',
    components: { Bar },
    props: {
        chartData: {
            type: Object,
            required: true,
        },
        styles: {
            type: Object,
            default: () => {
                // function here
            },
        },
        chartId: {
            type: String,
            default: 'bar-chart',
        },
        datasetIdKey: {
            type: String,
            default: 'label',
        },
        width: {
            type: Number,
            default: 400,
        },
        height: {
            type: Number,
            default: 400,
        },
        cssClasses: {
            default: '',
            type: String,
        },
        plugins: {
            type: Object,
            default: () => {
                // function here
            },
        },
        chartOptions: {
            type: Object,
            default: () => {
                // function here
            },
        },
    },
};
</script>
