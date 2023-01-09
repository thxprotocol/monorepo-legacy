import axios from 'axios';
import { Action, Module, VuexModule } from 'vuex-module-decorators';
import { createCanvas, loadImage, getContext } from 'canvas';

@Module({ namespaced: true })
class ImageModule extends VuexModule {
    @Action({ rawError: true })
    async upload(file: File) {
        let formData = new FormData();
        formData.append('file', file);

        const response = await axios({
            url: '/upload',
            method: 'PUT',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });

        // create the thumbnail for the image
        const width = 400; //thumbnail width

        const image = await loadImage(Buffer.from(await file.arrayBuffer()));
        const canvas = createCanvas(width, 0);
        const height = (image.height * width) / image.width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);

        // create the File for the Upload
        const typedArray = new Uint8Array(canvas.toBuffer());
        const blob = new Blob([typedArray], { type: 'image/jpeg' });
        const fileName = file.name.split('.')[0];
        const fileThumbnail = new File([blob], `${fileName}_thumbnail.jpg`);

        formData = new FormData();
        formData.append('file', fileThumbnail);

        const responseThumbnail = await axios({
            url: '/upload',
            method: 'PUT',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            data: formData,
        });

        return { imagePublicUrl: response.data.publicUrl, thumbnailPublicUrl: responseThumbnail.data.publicUrl };
    }
}

export default ImageModule;
