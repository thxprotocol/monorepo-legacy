<template>
    <b-button size="sm" variant="outline-gray" class="rounded-pill pr-3" @click="toggleShowArchived">
        <i class="fas mr-2" :class="{ 'fa-toggle-on': showArchived, 'fa-toggle-off': !showArchived }" />
        <span>Archived</span>
    </b-button>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseBtnToggleArchive extends Vue {
    showArchived = false;

    toggleShowArchived() {
        this.showArchived = !this.showArchived;
        this.$emit('archived', this.showArchived);
    }
}
</script>
