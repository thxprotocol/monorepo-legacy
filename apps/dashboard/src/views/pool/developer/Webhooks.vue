<template>
    <div>...</div>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';

@Component({
    components: {},
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class Clients extends Vue {
    get pool() {
        return this.pools[this.$route.params.id];
    }
}
</script>
