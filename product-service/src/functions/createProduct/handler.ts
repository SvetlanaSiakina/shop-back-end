import type {ValidatedEventAPIGatewayProxyEvent} from '@libs/api-gateway';
import {v4 as generateId} from 'uuid';
import {handleHttpError, middyfy} from '@libs/lambda';
import schema from './schema';
import {dynamoDB} from '@libs/ddbDocClient';
import {PutCommand} from '@aws-sdk/lib-dynamodb';
import {formatJSONResponse} from "@libs/api-gateway";

export const createProduct: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
    const ProductsTableName = process.env.TABLE_NAME_PRODUCTS;
    const ProductsStockTableName = process.env.TABLE_NAME_PRODUCTS_STOCK;
    try {
        const {body} = event;
        const {count, ...product} = body;
        const productId = generateId();

        await dynamoDB.send(new PutCommand({
            TableName: ProductsTableName,
            Item: {id: productId, ...product},
        }));

        await dynamoDB.send(new PutCommand({
            TableName: ProductsStockTableName,
            Item: {product_id: productId, count},
        }));

        return formatJSONResponse({
            data: productId,
        });

    } catch (e) {
        console.log('Failed to create product!');
        return handleHttpError(e);
    }
};

export const main = middyfy(createProduct);
