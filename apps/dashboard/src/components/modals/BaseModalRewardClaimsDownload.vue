<template>
    <base-modal
        size="xl"
        :title="`Download for ${selectedItems.length} rewards`"
        :id="id"
        :loading="isLoading"
        hide-footer
    >
        <template #modal-body v-if="!isLoading">
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
                                <b-dropdown :text="selectedUnit.label" variant="light">
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
                                <b-button :style="`background-color: #${color}`"></b-button>
                            </b-input-group-append>
                        </b-input-group>
                    </b-form-group>
                </b-col>
                <b-col>
                    <BCard bg-variant="light" :header="`Download ${claims.length} QR Codes`" class="mb-3">
                        <p class="text-gray">
                            You will receive a ZIP file containing QR code PDF's that you can share with your customers.
                        </p>
                        <b-button @click="onClickCreateZip" variant="primary" class="rounded-pill">
                            <i class="fas fa-qrcode mr-2"></i>
                            Download QR Codes in ZIP file
                        </b-button>
                        <hr />
                        <p class="text-gray">
                            You will receive a ZIP file containing QR code PDF's that you can share with your customers.
                        </p>
                        <b-button @click="onClickCreateCSV" variant="primary" class="rounded-pill">
                            <i class="fas fa-file-csv mr-2"></i>
                            Download Claim URLs in CSV file
                        </b-button>
                    </BCard>
                </b-col>
            </b-row>
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
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TBaseReward } from '@thxnetwork/types/index';
import { WALLET_URL, BASE_URL } from '@thxnetwork/dashboard/utils/secrets';
import { TClaim } from '@thxnetwork/dashboard/store/modules/claims';
import { saveAs } from 'file-saver';
import { loadImage } from '@thxnetwork/dashboard/utils/loadImage';

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
    components: {
        BaseModal,
    },
})
export default class BaseModalRewardClaimsDownload extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    color = '000000';
    size = 256;
    file: File | null = null;
    selectedFormat = 'png';
    selectedUnit = unitList[0];

    @Prop() id!: string;
    @Prop() rewards!: { [id: string]: TBaseReward & { claims: TClaim[]; _id: string } };
    @Prop() selectedItems!: string[];
    @Prop() pool!: IPool;

    get units() {
        return unitList.filter((u) => {
            return acceptedUnits[this.selectedFormat].includes(u.value);
        });
    }

    get claims() {
        if (!this.rewards) return [];
        const selectedRewards = Object.values(this.rewards).filter((r) => this.selectedItems.includes(r._id));
        let claims: TClaim[] = [];
        for (const r of selectedRewards) {
            if (!r.claims) continue;
            const pendingClaims = r.claims.filter((c) => {
                return !c.sub;
            });
            claims = claims.concat(pendingClaims);
        }
        return claims;
    }

    async createQRCode(url: string) {
        const imgSize = (this.size / 4) * 1.1;
        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;

        await QRCode.toCanvas(canvas, url, {
            errorCorrectionLevel: 'H',
            margin: 0,
            color: {
                dark: this.color,
                light: '#ffffff',
            },
            width: this.size,
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

    async createQRCodeSvg(url: string) {
        const qrcode = new QRCodeSVG({
            content: url,
            margin: 0,
            padding: 0,
            ecl: 'M',
        });
        qrcode.options.height = this.size;
        qrcode.options.width = this.size;
        // this.size = qrcode.options.height;
        const imgSize = this.size / 4;
        const positionX = this.size / 2 - imgSize / 2;
        const positionY = this.size / 2 - imgSize / 2;
        const svg = qrcode.svg();
        const xml = await xml2js.parseStringPromise(svg);

        const pdf = new jsPDF({ unit: this.selectedUnit.value as UnitValues, format: [this.size, this.size] });
        for (let i = 1; i < xml.svg.rect.length; i++) {
            const rect = xml.svg.rect[i].$;
            const rgb = hex2Rgb(this.color);

            pdf.setFillColor(rgb.r, rgb.g, rgb.b);
            pdf.rect(rect.x, rect.y, rect.width, rect.height, 'F');
        }

        const img = !this.file
            ? await loadImage(BASE_URL + '/assets/qr-logo.jpg')
            : await loadImage(URL.createObjectURL(this.file));
        pdf.addImage(img.src, 'JPG', positionX, positionY, imgSize, imgSize, '', 'NONE');

        return pdf.output('arraybuffer');
    }

    async onClickCreateZip() {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_qr_codes`;
        const zip = new JSZip();
        const archive = zip.folder(filename) as JSZip;

        for (const claim of this.claims) {
            let data: string | ArrayBuffer;
            const url = `${WALLET_URL}/claim/${claim.uuid}`;

            switch (this.selectedFormat) {
                case 'pdf': {
                    data = await this.createQRCodeSvg(url);
                    archive.file(`${claim.uuid}.pdf`, data, { base64: true });
                    break;
                }
                case 'png': {
                    data = await this.createQRCode(url);
                    archive.file(`${claim.uuid}.png`, data, { base64: true });
                    break;
                }
            }
        }

        zip.generateAsync({ type: 'blob' }).then((content) => saveAs(content, `${filename}.zip`));
    }

    onClickCreateCSV() {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_urls`;
        const data = this.claims.map((c) => [`${WALLET_URL}/claim/${c.uuid}`]);
        const csvContent = 'data:text/csv;charset=utf-8,' + data.map((e) => e.join(',')).join('\n');

        saveAs(encodeURI(csvContent), `${filename}.csv`);
    }
}
</script>
