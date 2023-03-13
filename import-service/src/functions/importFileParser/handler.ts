import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {handleHttpError, middyfy} from '@libs/lambda';
import csv from 'csv-parser';
import {formatJSONResponse} from "@libs/api-gateway";

const importFileParser = async (event) => {
    const s3Client = new S3Client({region: 'us-east-1'});

    try {
        for (let item of event.Records) {
            const res = await s3Client.send(
                new GetObjectCommand({
                    Bucket: 'my-shop-import',
                    Key: item.s3.object.key,
                }));
            const parse = async (stream: NodeJS.ReadableStream) => {
                return new Promise<void>((resolve, reject) => {
                    stream
                        .pipe(csv())
                        .on('data', (data) => {
                            console.log(item.s3.object.key, ': ', data);
                        })
                        .on('error', (err) => reject(err))
                        .on('end', async () => {
                            resolve();
                        });
                });
            };

            await parse(res.Body as NodeJS.ReadableStream);
        }
    } catch (ex) {
        handleHttpError(ex)
    }
    return formatJSONResponse({message: "Upload complete!!!"})
};
export const main = middyfy(importFileParser);
