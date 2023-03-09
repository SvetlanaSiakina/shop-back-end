import type { AWS } from '@serverless/typescript';
import { getProductById, getProductsList, createProduct, catalogBatchProcess } from '@functions/index';

const serverlessConfiguration: AWS = {
  service: 'product-service',
  frameworkVersion: '3',
  plugins: ['serverless-auto-swagger', 'serverless-esbuild'],
  provider: {
    name: 'aws',
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
      TABLE_NAME_PRODUCTS: 'AWS_Shop_Products',
      TABLE_NAME_PRODUCTS_STOCK: 'AWS_Shop_Products_Stock',
      SQS_URL: {
        Ref: 'SQSQueue'
      },
      SNS_ARN: {
        Ref: "SNSTopic"
      }
    },
    iamRoleStatements: [
      {
        Effect: 'Allow',
        Action: 'dynamodb:*',
        Resource: ['*'],
      },
      {
        Effect: 'Allow',
        Action: 'sns:*',
        Resource: {
          Ref: "SNSTopic"
        },
      },
      {
        Effect: 'Allow',
        Action: 'sqs:*',
        Resource: { "Fn::GetAtt": ['SQSQueue', 'Arn'] },
      },
    ],
  },
  resources: {
    Resources: {
      SQSQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue"
        }
      },
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "createProductTopic"
        }
      },
      SNSSubscriptionCountZero: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "nikitinasd@gmail.com",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic"
          },
          FilterPolicy: {
            count: [{"numeric": ["=", 0]}],
          }
        }
      },
      SNSSubscriptionCountNonZero: {
        Type: 'AWS::SNS::Subscription',
        Properties: {
          Endpoint: 'svetlana_siakina@epam.com',
          Protocol: 'email',
          TopicArn: {
            Ref: 'SNSTopic',
          },
          FilterPolicy: {
            count: [{"numeric": [">", 0]}],
          },
        }
      }
    },
    Outputs: {
      SQSQueueUrl: {
        Value: {
          Ref: 'SQSQueue'
        }
      },
      SQSQueueArn: {
        Value: {
          "Fn::GetAtt": ["SQSQueue", "Arn"]
        }
      }
    },
  },
  // import the function via paths
  functions: { getProductsList, getProductById, createProduct, catalogBatchProcess },
  package: { individually: true },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ['aws-sdk'],
      target: 'node14',
      define: { 'require.resolve': undefined },
      platform: 'node',
      concurrency: 10,
    },
  },
};

module.exports = serverlessConfiguration;
