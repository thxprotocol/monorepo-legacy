import axios from 'axios';
import { Action, Module, VuexModule } from 'vuex-module-decorators';
import uploadManager from '../../utils/uploadFile';
@Module({ namespaced: true })
class ImageModule extends VuexModule {
    @Action({ rawError: true })
    async upload(file: File) {
        const formData = new FormData();
        formData.append('file', file);
        // const response = await axios({
        //     url: '/upload',
        //     method: 'PUT',
        //     headers: {
        //         'Content-Type': 'multipart/form-data',
        //     },
        //     data: formData,
        // });
        //return response.data.publicUrl;
        const { bucket, key } = await uploadManager.upload(file, 'test');
        const publicUrl = await uploadManager.getPublicUrl(bucket, key);
        console.log('result', publicUrl);
        return publicUrl;
    }
}

export default ImageModule;
