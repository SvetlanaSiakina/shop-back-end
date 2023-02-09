import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { handleHttpError, middyfy } from '@libs/lambda';
import { mockProducts } from '../../mock-data/products';
import schema from './schema';

const getProductById: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    const id = event.pathParameters.productId;
    return formatJSONResponse({
      body: mockProducts.find(product => product.id === id),
    });
  } catch (e) {
    console.log('Failed to load product');
    return handleHttpError();
  }
};

export const main = middyfy(getProductById);
