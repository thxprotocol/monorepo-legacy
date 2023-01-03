import axios from 'axios';
import { Action, Module, VuexModule } from 'vuex-module-decorators';
import uploadManager from '../../utils/uploadFile';
@Module({ namespaced: true })
class ImageModule extends VuexModule {
    @Action({ rawError: true })
    async upload(payload: { file: File; folder: string }) {
        const { bucket, key } = await uploadManager.uploadTos3(payload.file, payload.folder);
        const publicUrl = uploadManager.getS3PublicUrl(bucket, key);
        return publicUrl;
    }
}

export default ImageModule;
