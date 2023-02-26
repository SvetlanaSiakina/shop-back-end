import type {ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {handleHttpError, middyfy} from '@libs/lambda';
import schema from './schema';
import {formatJSONResponse} from "@libs/api-gateway";

const importProductsFile: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const s3Client = new S3Client({ region: 'us-east-1' });

    const { name = '' } = event.queryStringParameters;
    if (!name) {
        return handleHttpError('Required file name');
    }

    try {
        const params = {
            Bucket: 'my-shop-import',
            Key: `uploaded/${name}`,
            ContentType: "text/csv"
        };
        const signedUrl = await getSignedUrl(s3Client, new PutObjectCommand(params), {
            expiresIn: 3600,
        });
        return formatJSONResponse({ signedUrl })
    } catch (ex) {
        console.log('Failed to import products file!');
        return handleHttpError(ex)
    }
};
export const main = middyfy(importProductsFile);
