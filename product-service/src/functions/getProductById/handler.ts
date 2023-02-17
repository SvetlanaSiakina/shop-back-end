import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { handleHttpError, middyfy } from '@libs/lambda';
import schema from './schema';
import { dynamoDB } from '@libs/ddbDocClient';
import { Product, ProductStock} from '../../model/product';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const ProductsTableName = process.env.TABLE_NAME_PRODUCTS;
  const ProductsStockTableName = process.env.TABLE_NAME_PRODUCTS_STOCK;
  const getProduct = async (productId: string): Promise<Product> => {
    const { Item } = await dynamoDB.send(
        new GetCommand({
          TableName: ProductsTableName,
          Key: {
            id: productId
          },
        })
    );
    return Item as Product;
  };

  const getCount = async (productId: string): Promise<number> => {
    const { Item } = await dynamoDB.send(
        new GetCommand({
          TableName: ProductsStockTableName,
          Key: {
            product_id: productId
          },
        })
    );
    return Item as ProductStock ? Item.count : 0 ;
  };

  try {
    const id = event.pathParameters.productId;
    const product = await getProduct(id);
    const count = await getCount(id);

    if (product) {
      return formatJSONResponse( { ...product, count });
    } else {
      return handleHttpError('This product not found');
    }
  } catch (e) {
    console.log('Failed to load product');
    return handleHttpError(e);
  }
};

export const main = middyfy(getProductById);
