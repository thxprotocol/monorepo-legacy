<template>
    <b-form-row>
        <b-col md="4">
            <strong>Virtual Wallets</strong>
            <p class="text-muted">
                Use virtual wallets to let your users start quests for users that don't have a THX account yet.
            </p>
        </b-col>
        <b-col md="8">
            <b-form-group label="Virtual Wallets Webhook"
                > 
                <pre class="rounded text-white p-3 d-flex align-items-center bg-dark" style="white-space: pre">
                    <b-button 
                    variant="light" 
                    v-clipboard:copy="code"
                    v-clipboard:success="() => isCopied = true" 
                    style="white-space: normal"
                    size="sm" 
                    class="mr-3">
                    <i class="fas  ml-0" :class="isCopied ? 'fa-clipboard-check' : 'fa-clipboard'"></i>
                </b-button>
                <code class="language-shell" v-html="codeExample"></code>
            </pre>
                <b-alert show variant="gray">
                    <i class="fas fa-question-circle mr-2"></i> Take note of these development guidelines
                    <ul class="px-3 mb-0 mt-1 small">
                        <li>
                            Store the returned <code>code</code> as part of the user data in your database and use it
                            when executing webhooks for custom quests.
                        </li>
                        <li v-if="pool.widget">
                            Let your users connect their virtual wallet with this URL syntax:
                            <code>{{ pool.widget.domain }}?thx_widget_path=/w/:code</code>
                        </li>
                    </ul>
                </b-alert>
            </b-form-group>
            <hr />
            <b-form-group label="Virtual Wallets">
                <BTable :items="wallets" show-empty responsive="lg">
                    <!-- Head formatting -->
                    <template #head(url)>URL</template>
                    <template #head(uuid)>Code</template>
                    <template #head(sub)> Account ID </template>
                    <template #head(createdAt)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(url)="{ item }">
                        <b-button variant="light" v-clipboard:copy="item.url" size="sm" class="mr-3">
                            <i class="fas ml-0 fa-clipboard"></i>
                        </b-button>
                    </template>
                    <template #cell(uuid)="{ item }">
                        <code>{{ item.uuid }}</code>
                    </template>
                    <template #cell(sub)="{ item }">
                        <span>{{ item.sub }}</span>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">
                            {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                        </small>
                    </template>
                </BTable>
            </b-form-group>
        </b-col>
    </b-form-row>
</template>
<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Vue } from 'vue-property-decorator';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { API_URL } from '@thxnetwork/dashboard/config/secrets';
import { format } from 'date-fns';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import hljs from 'highlight.js/lib/core';
import Shell from 'highlight.js/lib/languages/shell';

hljs.registerLanguage('shell', Shell);

@Component({
    components: { BaseCardURLWebhook },
    computed: mapGetters({
        pools: 'pools/all',
    }),
})
export default class Wallets extends Vue {
    format = format;
    pools!: IPools;
    isCopied = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get code() {
        if (!this.pool) return '';
        return `curl "${API_URL}/v1/webhook/wallet/${this.pool.token}" \\
-X POST`;
    }

    get codeExample() {
        return hljs.highlight(this.code || '', { language: 'shell' }).value;
    }

    get wallets() {
        if (!this.pool || !this.pool.wallets) return [];
        return this.pool.wallets.map((wallet) => ({
            url: this.pool.widget.domain + '?thx_widget_path=/w/' + wallet.uuid,
            uuid: wallet.uuid,
            sub: wallet.sub,
            createdAt: wallet.createdAt,
        }));
    }
}
</script>
