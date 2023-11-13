import * as cdk from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";
const corsOrigins = ["http://localhost:5173"];

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, "url-api", {
      restApiName: "URL Shortener Service",
      description: "This service handles shortening URLs",
      defaultCorsPreflightOptions: {
        allowOrigins: corsOrigins,
      },
      deployOptions: {
        cachingEnabled: true,
        cacheTtl: cdk.Duration.minutes(60),
      },
    });

    const urlsTable = new Table(this, "Urls", {
      tableName: "Urls",
      partitionKey: { name: "url", type: AttributeType.STRING },
      timeToLiveAttribute: "expiresAt",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const shortenUrlLambda = new NodejsFunction(this, "shortenUrlLambda", {
      functionName: "ShortenUrl",
      entry: path.join(__dirname, "../url_service/shorten_url/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(10),
      runtime: Runtime.NODEJS_18_X,
      environment: {
        CORS_ORIGINS: corsOrigins.toString(),
        TABLE_NAME: urlsTable.tableName,
      },
    });

    urlsTable.grantWriteData(shortenUrlLambda);

    const getLongUrlLambda = new NodejsFunction(this, "getLongUrlLambda", {
      functionName: "GetLongUrl",
      entry: path.join(__dirname, "../url_service/get_url/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(10),
      runtime: Runtime.NODEJS_18_X,
      environment: {
        CORS_ORIGINS: corsOrigins.toString(),
        TABLE_NAME: urlsTable.tableName,
      },
    });

    urlsTable.grantReadData(getLongUrlLambda);

    const urlRootResource = api.root.addResource("url");
    urlRootResource.addMethod("POST", new LambdaIntegration(shortenUrlLambda));

    const urlResource = urlRootResource.addResource("{shortUrl}", {
      defaultMethodOptions: {
        requestParameters: {
          ["method.request.path.shortUrl"]: true,
        },
      },
    });

    urlResource.addMethod(
      "GET",
      new LambdaIntegration(getLongUrlLambda, {
        cacheKeyParameters: ["method.request.path.shortUrl"],
      })
    );
  }
}
