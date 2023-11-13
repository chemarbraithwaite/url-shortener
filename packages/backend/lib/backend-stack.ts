import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);

    const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(",") ?? ["*"];
    const DOMAIN_NAME = process.env.DOMAIN_NAME ?? "";

    const corsIntegration = new cdk.aws_apigateway.MockIntegration({
      passthroughBehavior: cdk.aws_apigateway.PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": `{
          "statusCode": 200
        }`,
      },
      integrationResponses: [
        {
          statusCode: "204",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": `"'${
              CORS_ORIGINS?.[0] ?? DOMAIN_NAME
            }"'`,
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            "method.response.header.Access-Control-Allow-Methods":
              "'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT'",
          },
          responseTemplates: {
            "application/json": `
            
            #set($origin = $input.params().header.get("Origin"))
            #if($origin == "") #set($origin = $input.params().header.get("origin")) #end
            #set($domainList = [${CORS_ORIGINS.map((origin) => `"${origin}"`)}])

            #foreach($domain in $domainList)
              #if($origin.matches($domain))
              #set($context.responseOverride.header.Access-Control-Allow-Origin = $origin)
              #break
              #end
            #end
            `,
          },
        },
      ],
    });

    const api = new cdk.aws_apigateway.RestApi(this, "url-api", {
      restApiName: "URL Shortener Service",
      description: "This service handles shortening URLs",
      deployOptions: {
        cachingEnabled: true,
        cacheTtl: cdk.Duration.minutes(60),
      },
    });

    const corsMethodResponse = {
      methodResponses: [
        {
          statusCode: "204",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Origin": true,
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
          },
        },
      ],
    };

    api.root.addMethod("OPTIONS", corsIntegration, corsMethodResponse);

    const urlsTable = new cdk.aws_dynamodb.Table(this, "Urls", {
      tableName: "Urls",
      partitionKey: {
        name: "url",
        type: cdk.aws_dynamodb.AttributeType.STRING,
      },
      timeToLiveAttribute: "expiresAt",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const shortenUrlLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "shortenUrlLambda",
      {
        functionName: "ShortenUrl",
        entry: path.join(__dirname, "../url_service/shorten_url/index.ts"),
        handler: "handler",
        timeout: cdk.Duration.seconds(10),
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        environment: {
          CORS_ORIGINS: CORS_ORIGINS.toString(),
          TABLE_NAME: urlsTable.tableName,
        },
      }
    );

    urlsTable.grantWriteData(shortenUrlLambda);

    const getLongUrlLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "getLongUrlLambda",
      {
        functionName: "GetLongUrl",
        entry: path.join(__dirname, "../url_service/get_url/index.ts"),
        handler: "handler",
        timeout: cdk.Duration.seconds(10),
        runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
        environment: {
          CORS_ORIGINS: CORS_ORIGINS.toString(),
          TABLE_NAME: urlsTable.tableName,
        },
      }
    );

    urlsTable.grantReadData(getLongUrlLambda);

    const urlRootResource = api.root.addResource("url");
    urlRootResource.addMethod(
      "POST",
      new cdk.aws_apigateway.LambdaIntegration(shortenUrlLambda)
    );
    urlRootResource.addMethod("OPTIONS", corsIntegration, corsMethodResponse);

    const urlResource = urlRootResource.addResource("{shortUrl}", {
      defaultMethodOptions: {
        requestParameters: {
          ["method.request.path.shortUrl"]: true,
        },
      },
    });

    urlResource.addMethod("OPTIONS", corsIntegration, corsMethodResponse);
    urlResource.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(getLongUrlLambda, {
        cacheKeyParameters: ["method.request.path.shortUrl"],
      })
    );

    const FRONTEND_SRC_PATH = path.join(__dirname, "../../frontend/dist");

    const frontendBucket = new cdk.aws_s3.Bucket(this, "frontendBucket", {
      accessControl: cdk.aws_s3.BucketAccessControl.PRIVATE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    new cdk.aws_s3_deployment.BucketDeployment(this, "frontendDeployment", {
      sources: [cdk.aws_s3_deployment.Source.asset(FRONTEND_SRC_PATH)],
      destinationBucket: frontendBucket,
    });

    const hostedZone = new cdk.aws_route53.HostedZone(this, "hostedZone", {
      zoneName: DOMAIN_NAME,
    });

    const WWW_DOMAIN_NAME = `www.${DOMAIN_NAME}`;

    // Create the HTTPS certificate
    const httpsCertificate = new cdk.aws_certificatemanager.Certificate(
      this,
      "HttpsCertificate",
      {
        domainName: DOMAIN_NAME,
        subjectAlternativeNames: [WWW_DOMAIN_NAME],
        validation:
          cdk.aws_certificatemanager.CertificateValidation.fromDns(hostedZone),
      }
    );

    const originAccessIdentity = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    frontendBucket.grantRead(originAccessIdentity);

    const cloudFrontDistribution = new cdk.aws_cloudfront.Distribution(
      this,
      "CloudFrontDistribution",
      {
        defaultRootObject: "index.html",
        defaultBehavior: {
          origin: new cdk.aws_cloudfront_origins.S3Origin(frontendBucket, {}),
          viewerProtocolPolicy:
            cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          responseHeadersPolicy: {
            responseHeadersPolicyId: "67f7725c-6f97-4210-82d7-5512b31e9d03",
          },
        },
        domainNames: [DOMAIN_NAME, WWW_DOMAIN_NAME],
        certificate: httpsCertificate,
      }
    );

    new cdk.aws_route53.ARecord(this, "CloudFrontRedirect", {
      zone: hostedZone,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(cloudFrontDistribution)
      ),
      recordName: DOMAIN_NAME,
    });

    // Same from www. sub-domain
    new cdk.aws_route53.ARecord(this, "CloudFrontWWWRedirect", {
      zone: hostedZone,
      target: cdk.aws_route53.RecordTarget.fromAlias(
        new cdk.aws_route53_targets.CloudFrontTarget(cloudFrontDistribution)
      ),
      recordName: WWW_DOMAIN_NAME,
    });
  }
}
