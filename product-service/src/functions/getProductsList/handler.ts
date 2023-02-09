import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { handleHttpError, middyfy } from '@libs/lambda';
import { mockProducts } from '../../mock-data/products';
import schema from './schema';

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async () => {
  try {
    return formatJSONResponse({
      body: mockProducts
    });
  } catch (e) {
    console.log('Failed to load list of products');
    return handleHttpError();
  }
};

export const main = middyfy(getProductsList);
