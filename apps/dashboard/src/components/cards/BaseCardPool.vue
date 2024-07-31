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
                style="max-height: 170px; max-width: 100px; width: auto; height: auto"
            />
            <i v-else class="fas fa-image text-white" style="font-size: 3rem" />
        </header>
        <b-card-body class="p-3 d-flex align-items-center">
            <div class="mr-auto">
                <strong>{{ pool.settings.title }}</strong>
            </div>
            <b-dropdown variant="light" no-caret size="sm" right>
                <template #button-content>
                    <i class="fas fa-ellipsis-v m-0" />
                </template>
                <b-dropdown-item @click.stop="onClickDuplicate">Duplicate</b-dropdown-item>
                <b-dropdown-item @click.stop="onClickDelete">Delete</b-dropdown-item>
            </b-dropdown>
            <BaseModalDelete
                @submit="remove(pool._id)"
                :id="`modalDelete-${pool._id}`"
                :subject="pool.settings.title"
            />
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
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';

@Component({
    components: {
        BaseModalDelete,
    },
})
export default class BaseCardPool extends Vue {
    format = format;

    @Prop() pool!: TPool;

    onClick() {
        this.$router.push({ name: 'campaign', params: { id: this.pool._id } });
        this.$emit('click', this.pool);
    }

    async onClickDuplicate() {
        try {
            await this.$store.dispatch('pools/duplicate', this.pool);
        } catch (error) {
            this.$bvToast.toast((error as Error).toString(), {
                title: 'Error',
                variant: 'danger',
                autoHideDelay: 5000,
            });
        }
    }

    onClickDelete() {
        this.$bvModal.show(`modalDelete-${this.pool._id}`);
    }

    async remove(_id: string) {
        this.$store.dispatch('pools/remove', { _id });
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
