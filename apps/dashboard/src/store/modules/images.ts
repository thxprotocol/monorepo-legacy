import axios from 'axios';
import { Action, Module, VuexModule } from 'vuex-module-decorators';

@Module({ namespaced: true })
class ImageModule extends VuexModule {
    @Action({ rawError: true })
    async upload({ ipfs, file }: { ipfs: boolean; file: File }) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('ipfs', String(ipfs));

        const { data } = await axios({
            url: '/upload',
            method: 'PUT',
            headers: { 'Content-Type': 'multipart/form-data' },
            data: formData,
        });

        return data.publicUrl;
    }
}

export default ImageModule;
