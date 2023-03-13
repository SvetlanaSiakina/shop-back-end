import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { handleHttpError, middyfy } from '@libs/lambda';
import schema from './schema';
import { Product, ProductStock} from '../../model/product';
import { dynamoDB } from '@libs/ddbDocClient';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  const ProductsTableName = process.env.TABLE_NAME_PRODUCTS;
  const ProductsStockTableName = process.env.TABLE_NAME_PRODUCTS_STOCK;
  const getProductsService = async (): Promise<Product[]> => {

    const { Items } = await dynamoDB.send(new ScanCommand({
      TableName: ProductsTableName
    }))
    return Items as Product[];
  }

  const getProductsStockService = async (): Promise<ProductStock[]> => {
    const { Items } = await dynamoDB.send(new ScanCommand({
      TableName: ProductsStockTableName
    }))
    return Items as ProductStock[];
  }

  try {
    const products = await getProductsService();
    const stocks = await getProductsStockService();
    return formatJSONResponse({
      body: products.map((product) => {
        return {...product, count: stocks.find(stock => stock.product_id === product.id)?.count};
      })
    });
  } catch (e) {
    console.log('Failed to load list of products');
    return handleHttpError(e);
  }
};

export const main = middyfy(getProductsList);
