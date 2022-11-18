import { s3 } from '@thxnetwork/api/util/s3';
import Axios from 'axios';

export async function createMultipartUpload(params: { Bucket: string; Key: string }) {
    const res = await s3.createMultipartUpload(params).promise();
    return res.UploadId;
}

export async function generatePresignedUrlsParts(
    uploadId: string,
    parts: number,
    params: { Bucket: string; Key: string },
) {
    const baseParams = {
        Bucket: params.Bucket,
        Key: params.Key,
        UploadId: uploadId,
    };

    const promises = [];

    for (let index = 0; index < parts; index++) {
        promises.push(
            s3.getSignedUrlPromise('uploadPart', {
                ...baseParams,
                PartNumber: index + 1,
            }),
        );
    }

    const res = await Promise.all(promises);

    return res.reduce((map, part, index) => {
        map[index] = part;
        return map;
    }, {} as Record<number, string>);
}

interface Part {
    ETag: string;
    PartNumber: number;
}

export const FILE_CHUNK_SIZE = 10_000_000;

export async function uploadParts(file: Buffer, urls: Record<number, string>) {
    const axios = Axios.create();
    delete axios.defaults.headers.put['Content-Type'];

    const keys = Object.keys(urls);
    const promises = [];

    for (const indexStr of keys) {
        const index = parseInt(indexStr);
        const start = index * FILE_CHUNK_SIZE;
        const end = (index + 1) * FILE_CHUNK_SIZE;
        const blob = index < keys.length ? file.slice(start, end) : file.slice(start);

        promises.push(axios.put(urls[index], blob));
    }

    const resParts = await Promise.all(promises);

    return resParts.map((part, index) => ({
        ETag: (part as any).headers.etag,
        PartNumber: index + 1,
    }));
}

export async function completeMultiUpload(uploadId: string, parts: Part[], params: { Bucket: string; Key: string }) {
    const config = {
        Bucket: params.Bucket,
        Key: params.Key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
    };

    return await s3.completeMultipartUpload(config).promise();
}
