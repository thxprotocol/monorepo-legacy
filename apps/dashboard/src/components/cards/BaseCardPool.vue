<template>
    <b-card no-body @click="onClick" class="cursor-pointer h-100">
        <header
            class="card-img"
            :style="{
                backgroundImage: pool.brand && pool.brand.backgroundImgUrl && `url(${pool.brand.backgroundImgUrl})`,
                height: '200px',
            }"
        >
            <b-img
                v-if="pool.brand && pool.brand.logoImgUrl"
                class="card-img-logo"
                :src="pool.brand.logoImgUrl"
                widht="auto"
                height="100"
            />
            <div v-else>
                <i class="fas fa-image" />
            </div>
        </header>
        <b-card-body class="p-3">
            <strong>{{ pool.settings.title }}</strong>
        </b-card-body>
        <div class="d-flex align-items-center justify-content-between px-3 pb-1" style="opacity: 0.5">
            <div class="d-flex align-items-center text-opaque small">
                <span v-if="pool.author" class="mr-1"> {{ pool.author.username }} &CenterDot; </span>
                <span>{{ format(new Date(pool.createdAt), 'MMMM do') }} </span>
            </div>
            <div class="d-flex align-items-center text-opaque small">
                <i class="fas fa-users mr-1" />
                {{ pool.participantCount }}
            </div>
        </div>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { format } from 'date-fns';

@Component({})
export default class BaseCardPool extends Vue {
    format = format;
    @Prop() pool!: TPool;

    onClick() {
        this.$router.push({ name: 'pool', params: { id: this.pool._id } });
        this.$emit('click', this.pool);
    }
}
</script>

<style lang="scss">
.card-img {
    width: 100%;
    background: var(--primary);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
