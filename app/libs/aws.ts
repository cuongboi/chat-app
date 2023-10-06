import AWS from "aws-sdk";

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT } =
  process.env;

AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
  // @ts-ignore
  endpoint: AWS_ENDPOINT,
  apiVersions: {
    s3: "2006-03-01",
  },
  logger: process.stdout as any,
});

export default AWS;
