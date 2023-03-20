<template>
    <div
        class="alert alert-success px-2 py-1"
        :style="`background-color: ${Color(color).lighten(lighten)}; color: ${Color(color).darken(
            darken,
        )}; border-color: ${Color(color).darken(darken)}`"
    >
        <i class="mr-1" :class="icon"></i>
        {{ text }}
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Color from 'color';

@Component({})
export default class WidgetsView extends Vue {
    Color = Color;

    @Prop() icon!: string;
    @Prop() text!: string;
    @Prop() color!: string;
    @Prop() lighten!: number;
    @Prop() darken!: number;
}
</script>
