export function prepareFormDataForUpload(payload: any) {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
        if (key == 'file') {
            if (payload.file) {
                formData.append('file', payload.file);
            }
        } else {
            formData.set(key, payload[key]);
        }
    });
    return formData;
}
