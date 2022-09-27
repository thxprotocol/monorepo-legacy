import FormData from 'form-data';

import { apiClient } from '../util/api';

export default {
    post: async (file: Express.Multer.File): Promise<string> => {
        const form = new FormData({ readable: true, dataSize: file.size });

        form.append('file', file.buffer, {
            contentType: file.mimetype,
            filename: file.originalname,
        });

        const r = await apiClient({
            url: '/v1/upload',
            method: 'PUT',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
            },
            data: form,
        });

        return r.data.publicUrl as string;
    },
};
