export function prepareFormDataForUpload(payload: any) {
    const formData = new FormData();
    Object.keys(payload).forEach((key) => {
        if (key == 'file') {
            if (payload.file) {
                formData.append('file', payload.file);
            }
        } else {
            if (payload[key] !== undefined) {
                let value = payload[key];
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                formData.set(key, value);
            }
        }
    });
    return formData;
}
