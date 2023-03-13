import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {SQSClient} from "@aws-sdk/client-sqs";
import {handleHttpError} from '@libs/lambda';
import csv from 'csv-parser';
import {formatJSONResponse} from "@libs/api-gateway";
import {SendMessageCommand} from '@aws-sdk/client-sqs';


const importFileParser = async (event) => {
    const s3Client = new S3Client({region: 'us-east-1'});
    const sqsClient = new SQSClient({region: 'us-east-1'});

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
                        .on('data', async (data) => {
                            try {
                                await sqsClient.send(new SendMessageCommand({
                                    MessageBody: JSON.stringify(data),
                                    QueueUrl: process.env.SQS_URL,
                                }));
                            } catch (err) {
                                console.warn("Can't send to SQS: ", err);
                            }
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
export const main = importFileParser;
