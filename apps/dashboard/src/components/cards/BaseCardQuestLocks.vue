<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            @click="isVisible = !isVisible"
        >
            <strong>Quest Locks</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <BaseFormGroupQuestLocks @change-locks="$emit('change-locks', $event)" :locks="locks" :pool="pool" />
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseFormGroupQuestLocks from '@thxnetwork/dashboard/components/form-group/BaseFormGroupQuestLocks.vue';

@Component({
    components: {
        BaseFormGroupQuestLocks,
    },
    computed: mapGetters({
        questList: 'pools/quests',
    }),
})
export default class BaseCardQuestLocks extends Vue {
    isVisible = true;

    @Prop() pool!: TPool;
    @Prop() locks!: TQuestLock[];
}
</script>
