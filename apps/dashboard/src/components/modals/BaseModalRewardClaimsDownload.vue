<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="`Download Claims for ${selectedItems.length} perks`"
        :id="id"
        :loading="isLoading"
        hide-footer
    >
        <template #modal-body v-if="!isLoading">
            <b-tabs>
                <b-tab title="Download" active>
                    <b-row class="mt-3">
                        <b-col>
                            <b-form-group label="File format">
                                <b-form-radio v-model="selectedFormat" name="fileFormat" value="png">
                                    <p>
                                        <strong>PNG</strong><br />
                                        You are planning to use your QR codes digitally.
                                    </p>
                                </b-form-radio>
                                <b-form-radio v-model="selectedFormat" name="fileFormat" value="pdf">
                                    <p>
                                        <strong>PDF</strong><br />
                                        You are planning to print your QR codes.
                                    </p>
                                </b-form-radio>
                            </b-form-group>
                            <b-form-group label="Size" description="Dimensions of the image.">
                                <b-input-group>
                                    <b-form-input v-model="size" type="number" />
                                    <template #append>
                                        <b-dropdown :text="selectedUnit.label" variant="dark">
                                            <b-dropdown-item
                                                @click="selectedUnit = unit"
                                                :key="key"
                                                v-for="(unit, key) of units"
                                            >
                                                {{ unit.label }}
                                            </b-dropdown-item>
                                        </b-dropdown>
                                    </template>
                                </b-input-group>
                            </b-form-group>

                            <b-form-group
                                label="Image"
                                :description="`Visible in the center of your QR code. Only accepts .jpg, .jpeg, .gif, .png.`"
                            >
                                <b-form-file
                                    v-model="file"
                                    accept=".jpg, .jpeg, .gif, .png"
                                    placeholder="Choose or drop here..."
                                    drop-placeholder="Drop file here..."
                                ></b-form-file>
                            </b-form-group>

                            <b-form-group label="Color" description="Foreground color against white background.">
                                <b-input-group prepend="#">
                                    <b-form-input v-model="color" />
                                    <b-input-group-append>
                                        <b-button :style="`background-color: #${color}; width: 50px;`"></b-button>
                                    </b-input-group-append>
                                </b-input-group>
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <b-form-group
                                label="Download"
                                description="Download a Zip file containing all QR codes or a spreadsheet (CSV) containing all URL's."
                            >
                                <b-button-group class="w-100">
                                    <b-button variant="primary" @click="onClickDownloadZipAll">
                                        <b-spinner small variant="light" v-if="index" />
                                        <template v-else>Zip</template>
                                    </b-button>
                                    <b-button variant="primary" @click="onClickDownloadCSVAll"> CSV </b-button>
                                </b-button-group>
                            </b-form-group>
                            <b-progress
                                v-if="index"
                                :value="index"
                                :max="selectedClaims.length"
                                variant="primary"
                                show-value
                                class="mt-2"
                            />
                        </b-col>
                    </b-row>
                </b-tab>
                <b-tab :title="`Claim URLs (${claims.length})`">
                    <b-card class="bg-light m-3" title="Supply">
                        <b-progress :value="claims.filter((c) => c.sub).length" :max="claims.length" show-value />
                    </b-card>
                    <BaseCardTableHeader
                        :page="page"
                        :limit="limit"
                        :pool="pool"
                        :total-rows="claims.length"
                        :selectedItems="selectedItems"
                        :actions="[
                            { variant: 0, label: `Delete claims` },
                            { variant: 1, label: 'Download QR Codes' },
                            { variant: 2, label: 'Download URL\'s' },
                        ]"
                        @click-action="onClickAction"
                        @change-page="onChangePage"
                        @change-limit="onChangeLimit"
                    />
                    <BTable hover :busy="isLoading" :items="claimsByPage" responsive="lg" show-empty>
                        <!-- Head formatting -->
                        <template #head(checkbox)>
                            <b-form-checkbox @change="onSelectAll" />
                        </template>
                        <template #head(url)> URL </template>
                        <template #head(sub)> Sub </template>
                        <template #head(claimedAt)> User </template>
                        <template #head(createdAt)> Created </template>
                        <template #head(id)> &nbsp; </template>

                        <!-- Cell formatting -->
                        <template #cell(checkbox)="{ item }">
                            <b-form-checkbox :value="item.checkbox" v-model="selectedClaims" />
                        </template>
                        <template #cell(url)="{ item }">
                            <b-link
                                size="sm"
                                variant="light"
                                class="mr-2"
                                v-clipboard:copy="item.url"
                                v-clipboard:success="() => $set(isCopied, item.id, true)"
                            >
                                <code class="text-muted">
                                    {{ item.id }}
                                </code>
                                <i
                                    class="fas ml-0 text-gray"
                                    :class="isCopied[item.id] ? 'fa-clipboard-check' : 'fa-clipboard'"
                                ></i>
                            </b-link>
                        </template>
                        <template #cell(claimedAt)="{ item }">
                            <BaseParticipantAccount v-if="item.claimedAt.account" :account="item.claimedAt.account" />
                            <small v-if="item.claimedAt.date" class="text-muted">
                                Claimed at: {{ format(new Date(item.claimedAt.date), 'dd-MM-yyyy HH:mm') }}
                            </small>
                            <!-- <div v-if="item.claimedAt.sub" style="line-height: 1">
                                <div class="text-primary">{{ item.claimedAt.sub }}</div>
                                <small class="text-muted">
                                    Claimed at: {{ format(new Date(item.claimedAt.date), 'dd-MM-yyyy HH:mm') }}
                                </small>
                            </div> -->
                        </template>
                        <template #cell(createdAt)="{ item }">
                            <small class="text-muted">
                                {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                            </small>
                        </template>
                        <template #cell(id)="{ item }">
                            <b-dropdown variant="link" size="sm" right no-caret>
                                <template #button-content>
                                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                                </template>
                                <b-dropdown-item @click="item" disabled> Delete </b-dropdown-item>
                            </b-dropdown>
                        </template>
                    </BTable>
                </b-tab>
            </b-tabs>
        </template>
    </base-modal>
</template>

<script lang="ts">
import BaseModal from './BaseModal.vue';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import QRCodeSVG from 'qrcode-svg';
import xml2js from 'xml2js';
import { jsPDF } from 'jspdf';
import { type TPool } from '@thxnetwork/types/interfaces';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TBaseReward } from '@thxnetwork/types/index';
import { API_URL, BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { TClaim } from '@thxnetwork/dashboard/store/modules/claims';
import { saveAs } from 'file-saver';
import { loadImage } from '@thxnetwork/dashboard/utils/loadImage';
import { format } from 'date-fns';
import BaseParticipantAccount, { parseAccount } from '../BaseParticipantAccount.vue';

const unitList = [
    { label: 'Pixels', value: 'px' },
    { label: 'Centimeters', value: 'cm' },
    { label: 'Inch', value: 'in' },
    { label: 'Millimeters', value: 'mm' },
];
type UnitValues = 'px' | 'cm' | 'in' | 'mm';

const acceptedUnits: { [format: string]: string[] } = {
    png: ['px'],
    pdf: ['px', 'cm', 'in', 'mm'],
};

function hex2Rgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) as string[];
    return {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };
}

@Component({
    name: 'BaseModalRewardClaimsDownload',
    components: {
        BaseParticipantAccount,
        BaseCardTableHeader: () => import('@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue'),
        BaseModal,
    },
})
export default class BaseModalRewardClaimsDownload extends Vue {
    format = format;
    isSubmitDisabled = false;
    isLoading = false;
    color = '000000';
    size = 256;
    file: File | null = null;
    redirectUrl = '';
    selectedFormat = 'png';
    selectedUnit = unitList[0];
    selectedClaims: string[] = [];
    limit = 500;
    page = 1;
    index = 0;
    claims: any[] = [];
    isCopied: { [id: string]: boolean } = {};

    @Prop() id!: string;
    @Prop() rewards!: { [id: string]: TBaseReward & { claims: TClaim[]; _id: string } };
    @Prop() selectedItems!: string[];
    @Prop() pool!: TPool;

    onShow() {
        this.getClaimURLs();
        this.redirectUrl = this.pool.widget.domain;
    }

    getClaimURLs() {
        const rewards = Object.values(this.rewards).filter((r) => this.selectedItems.includes(r._id));
        this.claims = [];
        for (const r of rewards) {
            const claims = Object.values(r.claims).map((claim: TClaim) => ({ ...claim, perk: r }));
            this.claims = [...this.claims, ...claims].map((c) => ({
                checkbox: c.uuid,
                url: this.getUrl(c.uuid),
                claimedAt: {
                    account: parseAccount({ id: c.sub, account: c.account }),
                    date: c.claimedAt,
                },
                createdAt: c.createdAt,
                id: c.uuid,
            }));
        }
    }

    get units() {
        return unitList.filter((u) => acceptedUnits[this.selectedFormat].includes(u.value));
    }

    get claimsByPage() {
        if (!this.claims) return [];
        return this.claims
            .sort((a, b) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .slice(this.page * this.limit - this.limit, this.page * this.limit);
    }

    onChangeRedirectURL() {
        this.getClaimURLs();
    }

    onSelectAll(isSelectAll: boolean) {
        this.selectedClaims = isSelectAll ? (this.claimsByPage.map((r) => r.id) as string[]) : [];
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
    }

    onChangePage(page: number) {
        this.page = page;
    }

    onClickDownloadZipAll() {
        this.selectedClaims = this.claims.map((c) => c.id);
        this.onClickCreateZip();
    }

    onClickDownloadCSVAll() {
        this.selectedClaims = this.claims.map((c) => c.id);
        this.onClickCreateCSV();
    }

    onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedClaims)) {
                    console.log('Delete claim', id);
                }
                break;
            case 1:
                this.onClickCreateZip();
                break;
            case 2:
                this.onClickCreateCSV();
                break;
        }
    }

    async createQRCode(url: string, size: number, color: string) {
        const imgSize = (size / 4) * 1.1;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        await QRCode.toCanvas(canvas, url, {
            errorCorrectionLevel: 'H',
            margin: 0,
            color: {
                dark: color,
                light: '#ffffff',
            },
            width: size,
        });

        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        const img = !this.file
            ? await loadImage(BASE_URL + '/assets/qr-logo.jpg')
            : await loadImage(URL.createObjectURL(this.file));
        const positionX = ctx.canvas.height / 2 - imgSize / 2;
        const positionY = ctx.canvas.width / 2 - imgSize / 2;

        ctx.drawImage(img, positionX, positionY, imgSize, imgSize);

        const qrCode = canvas.toDataURL('image/png');

        return qrCode.replace(/^data:image\/png;base64,/, '');
    }

    async createQRCodeSvg(url: string, size: number, color: string, unit) {
        const qrcode = new QRCodeSVG({
            content: url,
            margin: 0,
            padding: 0,
            ecl: 'M',
        });
        qrcode.options.height = size;
        qrcode.options.width = size;

        const imgSize = size / 4;
        const positionX = size / 2 - imgSize / 2;
        const positionY = size / 2 - imgSize / 2;
        const svg = qrcode.svg();
        const xml = await xml2js.parseStringPromise(svg);

        const pdf = new jsPDF({ unit, format: [size, size] });
        for (let i = 1; i < xml.svg.rect.length; i++) {
            const rect = xml.svg.rect[i].$;
            const rgb = hex2Rgb(color);

            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(rect.x, rect.y, rect.width, rect.height, 'F');
        }

        const img = !this.file
            ? await loadImage(BASE_URL + '/assets/qr-logo.jpg')
            : await loadImage(URL.createObjectURL(this.file));
        pdf.addImage(img.src, 'JPG', positionX, positionY, imgSize, imgSize, '', 'NONE');

        return pdf.output('arraybuffer');
    }

    getUrl(uuid: string) {
        const url = new URL(API_URL);
        url.pathname = `v1/claims/r/${uuid}`;
        return url.toString();
    }

    async onClickCreateZip() {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_qr_codes`;
        const zip = new JSZip();
        const archive = zip.folder(filename) as JSZip;
        const format = this.selectedFormat;

        for (const uuid of this.selectedClaims) {
            let data: string | ArrayBuffer;
            const url = this.getUrl(uuid);

            switch (format) {
                case 'pdf': {
                    data = await this.createQRCodeSvg(
                        url,
                        this.size,
                        this.color,
                        this.selectedUnit.value as UnitValues,
                    );
                    archive.file(`${uuid}.pdf`, data, { base64: true });
                    break;
                }
                case 'png': {
                    data = await this.createQRCode(url, this.size, this.color);
                    archive.file(`${uuid}.png`, data, { base64: true });
                    break;
                }
            }
            this.index++;
        }

        await zip.generateAsync({ type: 'blob' }).then((content) => saveAs(content, `${filename}.zip`));
        this.index = 0;
    }

    onClickCreateCSV() {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_urls`;
        const data = this.selectedClaims.map((uuid) => [this.getUrl(uuid)]);
        const csvContent = 'data:text/csv;charset=utf-8,' + data.map((e) => e.join(',')).join('\n');
        saveAs(encodeURI(csvContent), `${filename}.csv`);
    }
}
</script>
