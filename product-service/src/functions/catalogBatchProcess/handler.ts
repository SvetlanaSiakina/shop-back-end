import {SNSClient} from "@aws-sdk/client-sns";
import {PublishCommand} from '@aws-sdk/client-sns';
import {createProduct} from "../createProduct/handler"
import {handleHttpError} from '@libs/lambda';
import {formatJSONResponse} from "@libs/api-gateway";

const catalogBatchProcess = async event => {

    const snsClient = new SNSClient({ region: "us-east-1" });

    try {
        const products: {title, description, price, count}[] = event.Records.map(({ body }) => JSON.parse(body));;

        for (const product of products) {
            const { title, description, price, count } = product;

            if (!Boolean(title && description && price && count)) {
                return
            }

            if (await createProduct({
                headers: undefined,
                httpMethod: "",
                isBase64Encoded: false,
                multiValueHeaders: undefined,
                multiValueQueryStringParameters: undefined,
                path: "",
                pathParameters: undefined,
                queryStringParameters: undefined,
                requestContext: undefined,
                resource: "",
                stageVariables: undefined,
                body: product}, undefined, undefined)) {
                console.info("Product created: ", product.title);

                const message = {
                    Subject: 'Product was added',
                    Message: JSON.stringify(product),
                    TopicArn: process.env.SNS_ARN,
                    MessageAttributes: {
                        count: {
                            DataType: 'Number',
                            StringValue: product.count
                        },
                    },
                };
                const command = new PublishCommand(message);
                await snsClient.send(command);
            }
        }
        return formatJSONResponse({ message: "Messages sended" });
    } catch (error) {
        console.log('catalogBatchProcess error: ', error);
        return handleHttpError(error);
    }
};

export const main = catalogBatchProcess;
