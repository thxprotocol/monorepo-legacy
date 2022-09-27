import JSZip from 'jszip';

export const createArchiver = () => {
    const jsZip = new JSZip();
    return {
        jsZip,
        archive: jsZip.folder('qrcodes'),
    };
};
