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
                        <b-form-radio v-model="fileFormats" name="fileFormat" value=".jpg, .jpeg, .gif, .png">
                            <p>
                                <strong>PNG</strong><br />
                                You are planning to use your QR codes digitally.
                            </p>
                        </b-form-radio>
                        <b-form-radio v-model="fileFormats" name="fileFormat" value=".svg" disabled>
                            <p>
                                <strong>PDF</strong><br />
                                You are planning to print your QR codes.
                            </p>
                        </b-form-radio>
                    </b-form-group>
                    <b-form-group
                        label="Image"
                        :description="`Visible in the center of your QR code. Only accepts ${fileFormats}.`"
                    >
                        <b-form-file
                            v-model="file"
                            :accept="fileFormats"
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
                    {{ claims }}
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
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import { TBaseReward } from '@thxnetwork/types/index';
import { WALLET_URL, BASE_URL } from '@thxnetwork/dashboard/utils/secrets';
import { TClaim } from '@thxnetwork/dashboard/store/modules/claims';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from 'canvas';
import { saveAs } from 'file-saver';

@Component({
    components: {
        BaseModal,
    },
})
export default class BaseModalRewardClaimsDownload extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    color = '000000';
    file: File | null = null;
    fileFormats = '.jpg, .jpeg, .gif, .png';

    @Prop() id!: string;
    @Prop() rewards!: { [id: string]: TBaseReward & { claims: TClaim[]; _id: string } };
    @Prop() selectedItems!: string[];
    @Prop() pool!: IPool;

    get claims() {
        if (!this.rewards) return [];
        const selectedRewards = Object.values(this.rewards).filter((r) => this.selectedItems.includes(r._id));
        let claims: TClaim[] = [];
        for (const r of selectedRewards) {
            const pendingClaims = r.claims.filter((c) => {
                return !c.sub;
            });
            claims = claims.concat(pendingClaims);
        }
        return claims;
    }

    async createQRCode(url: string) {
        const canvasSize = 220;
        const imgSize = 58;
        const canvas = createCanvas(canvasSize, canvasSize);

        await QRCode.toCanvas(canvas, url, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: this.color,
                light: '#ffffff',
            },
            width: canvasSize,
        });

        const ctx = canvas.getContext('2d');
        const img = !this.file
            ? await loadImage(BASE_URL + '/assets/qr-logo.jpg')
            : await loadImage(URL.createObjectURL(this.file));
        const positionX = ctx.canvas.height / 2 - imgSize / 2;
        const positionY = ctx.canvas.width / 2 - imgSize / 2;

        ctx.drawImage(img, positionX, positionY, imgSize, imgSize);

        const qrCode = canvas.toDataURL('image/png');
        return qrCode.replace(/^data:image\/png;base64,/, '');
    }

    async onClickCreateZip() {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_qr_codes`;
        const zip = new JSZip();
        const archive = zip.folder(filename) as JSZip;

        for (const claim of this.claims) {
            const base64Data = await this.createQRCode(`${WALLET_URL}/claim/${claim.id}`);
            archive.file(`${claim.id}.png`, base64Data, { base64: true });
        }

        zip.generateAsync({ type: 'blob' }).then((content) => saveAs(content, `${filename}.zip`));
    }

    onClickCreateCSV() {
        const filename = `${new Date().getTime()}_${this.pool._id}_claim_urls`;
        const data = this.claims.map((c) => [`${WALLET_URL}/claim/${c.id}`]);
        debugger;
        const csvContent = 'data:text/csv;charset=utf-8,' + data.map((e) => e.join(',')).join('\n');

        saveAs(encodeURI(csvContent), `${filename}.csv`);
    }
}
</script>
