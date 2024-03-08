<template>
    <base-modal @show="onShow" size="xl" title="QR Codes" :id="id" hide-footer>
        <template #modal-body>
            <b-tabs v-model="tabIndex" content-class="py-3" justified>
                <b-tab title="Create">
                    <b-form-group
                        label="Amount"
                        description="We currently support a maximum of 5000 QR codes per preward. Contact our support if you require more!"
                    >
                        <b-form-input v-model="claimAmount" type="number" :max="5000" />
                    </b-form-group>

                    <b-form-group
                        label="Redirect URL"
                        description="Important: Replace with a URL that contains your campaign widget."
                    >
                        <b-form-input v-model="redirectURL" />
                    </b-form-group>

                    <b-button @click="onClickCreate" block variant="primary" :disabled="isLoading" class="rounded-pill">
                        <b-spinner small variant="light" v-if="isLoading" />
                        <template v-else>Create {{ claimAmount || '' }} QR Codes</template>
                    </b-button>
                </b-tab>
                <b-tab title="Entries">
                    <b-form-group label="QR code supply">
                        <b-progress :value="qrCodes.meta.participantCount" :max="qrCodes.total" show-value />
                    </b-form-group>
                    <BaseCardTableHeader
                        :page="page"
                        :limit="limit"
                        :pool="pool"
                        :total-rows="qrCodes.total"
                        :selected-items="selectedQRCodeEntries"
                        :actions="[
                            { variant: 0, label: `Delete claims` },
                            { variant: 1, label: 'Download QR Codes' },
                            { variant: 2, label: 'Download URL\'s' },
                        ]"
                        @click-action="onClickAction"
                        @change-page="onChangePage"
                        @change-limit="onChangeLimit"
                    />
                    <BTable hover :busy="isLoading" :items="qrCodeEntries" responsive="lg" show-empty>
                        <!-- Head formatting -->
                        <template #head(checkbox)>
                            <b-form-checkbox @change="onSelectAll" />
                        </template>
                        <template #head(url)> URL </template>
                        <template #head(account)> Account </template>
                        <template #head(claimedAt)> Claimed </template>
                        <template #head(createdAt)> Created </template>
                        <template #head(entry)> &nbsp; </template>

                        <!-- Cell formatting -->
                        <template #cell(checkbox)="{ item }">
                            <b-form-checkbox :value="item.checkbox" v-model="selectedQRCodeEntries" />
                        </template>
                        <template #cell(url)="{ item }">
                            <b-link
                                size="sm"
                                class="mr-2"
                                variant="light"
                                v-clipboard:copy="item.url"
                                v-clipboard:success="() => $set(isCopied, item.entry.uuid, true)"
                            >
                                <code class="text-muted">
                                    {{ item.entry.uuid }}
                                </code>
                                <i
                                    class="fas ml-0 text-gray"
                                    :class="isCopied[item.entry.uuid] ? 'fa-clipboard-check' : 'fa-clipboard'"
                                />
                            </b-link>
                        </template>
                        <template #cell(account)="{ item }">
                            <BaseParticipantAccount v-if="item.account" :account="item.account" />
                        </template>
                        <template #cell(claimedAt)="{ item }">
                            <small v-if="item.claimedAt" class="text-muted">
                                {{ format(new Date(item.claimedAt), 'dd-MM-yyyy HH:mm') }}
                            </small>
                        </template>
                        <template #cell(createdAt)="{ item }">
                            <small class="text-muted">
                                {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                            </small>
                        </template>
                        <template #cell(entry)="{ item }">
                            <b-dropdown variant="link" size="sm" right no-caret>
                                <template #button-content>
                                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                                </template>
                                <b-dropdown-item @click="onClickDelete(item.entry.uuid)" :disabled="item.entry.sub">
                                    Delete
                                </b-dropdown-item>
                            </b-dropdown>
                        </template>
                    </BTable>
                </b-tab>
                <b-tab title="Download">
                    <b-row>
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
                                    <b-button variant="primary" @click="onClickDownloadZipAll" :disabled="isLoadingAll">
                                        <b-spinner small variant="light" v-if="index" />
                                        <template v-else>Zip</template>
                                    </b-button>
                                    <b-button variant="primary" @click="onClickDownloadCSVAll" :disabled="isLoadingAll">
                                        CSV
                                    </b-button>
                                </b-button-group>
                            </b-form-group>

                            <b-progress
                                v-if="index"
                                :value="index"
                                :max="allCodes.length"
                                variant="primary"
                                show-value
                                class="mt-2"
                            />
                        </b-col>
                    </b-row>
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
import { Component, Prop, Vue } from 'vue-property-decorator';
import { API_URL, BASE_URL } from '@thxnetwork/dashboard/config/secrets';
import { saveAs } from 'file-saver';
import { loadImage } from '@thxnetwork/dashboard/utils/loadImage';
import { format } from 'date-fns';
import { TQRCodeEntryState } from '@thxnetwork/dashboard/store/modules/qrcodes';
import { mapGetters } from 'vuex';
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
    name: 'BaseModalQRCodes',
    components: {
        BaseParticipantAccount,
        BaseModal,
        BaseCardTableHeader: () => import('@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue'),
    },
    computed: mapGetters({
        qrCodeEntryList: 'qrcodes/all',
    }),
})
export default class BaseModalQRCodes extends Vue {
    format = format;
    isSubmitDisabled = false;
    isLoadingAll = false;
    isLoading = false;
    color = '000000';
    size = 256;
    file: File | null = null;
    isCopied: { [id: string]: boolean } = {};

    selectedFormat = 'png';
    selectedUnit = unitList[0];
    selectedQRCodeEntries: string[] = [];
    allCodes = [];

    limit = 25;
    page = 1;
    index = 0;
    tabIndex = 0;
    claimAmount = 0;
    redirectURL = '';

    qrCodeEntryList!: TQRCodeEntryState;

    @Prop() id!: string;
    @Prop() reward!: TRewardNFT;
    @Prop() pool!: TPool;

    get qrCodes() {
        if (!this.qrCodeEntryList || !this.qrCodeEntryList[this.reward._id])
            return { total: 0, results: [], meta: { participantCount: 0 } };
        return this.qrCodeEntryList[this.reward._id];
    }

    get qrCodeEntries() {
        return this.qrCodes.results.map((entry: TQRCodeEntry) => ({
            checkbox: entry.uuid,
            url: this.getUrl(entry.uuid),
            account: parseAccount({ id: entry.sub, account: entry.account }),
            claimedAt: entry.claimedAt,
            createdAt: entry.createdAt,
            entry,
        }));
    }

    get units() {
        return unitList.filter((u) => acceptedUnits[this.selectedFormat].includes(u.value));
    }

    onShow() {
        this.listEntries();
        this.claimAmount = 0;
        this.redirectURL = this.getRedirectURL();
    }

    getRedirectURL() {
        const url = new URL(BASE_URL);
        url.pathname = `/preview/${this.pool._id}`;
        return url.toString();
    }

    async onClickCreate() {
        this.isLoading = true;
        await this.$store.dispatch('qrcodes/create', {
            rewardId: this.reward._id,
            claimAmount: this.claimAmount,
            redirectURL: this.redirectURL,
        });
        await this.listEntries();
        this.tabIndex = 1;
    }

    async listEntries() {
        this.isLoading = true;
        this.page = 1;
        await this.$store.dispatch('qrcodes/list', { reward: this.reward, page: this.page, limit: this.limit });
        this.isLoading = false;
    }

    onChangeRedirectURL() {
        this.listEntries();
    }

    onSelectAll(isSelectAll: boolean) {
        this.selectedQRCodeEntries = isSelectAll ? this.qrCodeEntries.map((e) => e.entry.uuid) : [];
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listEntries();
    }

    onChangePage(page: number) {
        this.page = page;
        this.listEntries();
    }

    async listAll() {
        this.allCodes = await this.$store.dispatch('qrcodes/listAll', { reward: this.reward, page: 1, limit: 5000 });
    }

    async onClickDownloadZipAll() {
        this.isLoadingAll = true;

        // Fetch all codes (max 5000)
        await this.listAll();

        // Create the zip
        await this.onClickCreateZip(this.allCodes);

        this.isLoadingAll = false;
    }

    async onClickDownloadCSVAll() {
        this.isLoadingAll = true;
        // Fetch all codes (max 5000)
        await this.listAll();

        // Create the CSV
        this.onClickCreateCSV(this.allCodes);

        this.isLoadingAll = false;
    }

    onClickDelete(uuid: string) {
        this.removeQRCode(uuid);
    }

    async removeQRCode(uuid: string) {
        await this.$store.dispatch('qrcodes/remove', uuid);
    }

    async onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                this.isLoading = true;
                for (const uuid of Object.values(this.selectedQRCodeEntries)) {
                    await this.removeQRCode(uuid);
                }
                await this.listEntries();
                this.isLoading = false;
                break;
            case 1:
                this.onClickCreateZip(this.selectedQRCodeEntries);
                break;
            case 2:
                this.onClickCreateCSV(this.selectedQRCodeEntries);
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
        url.pathname = `/v1/qr-codes/r/${uuid}`;
        return url.toString();
    }

    async onClickCreateZip(codes: string[]) {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_qr_codes`;
        const zip = new JSZip();
        const archive = zip.folder(filename) as JSZip;
        const format = this.selectedFormat;

        for (const uuid of codes) {
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

    onClickCreateCSV(codes: string[]) {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_urls`;
        const data = codes.map((uuid) => [this.getUrl(uuid)]);
        const csvContent = 'data:text/csv;charset=utf-8,' + data.map((e) => e.join(',')).join('\n');
        saveAs(encodeURI(csvContent), `${filename}.csv`);
    }
}
</script>
