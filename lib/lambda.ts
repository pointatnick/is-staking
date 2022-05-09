import {
  LambdaClient,
  InvokeCommand,
  InvocationType,
} from '@aws-sdk/client-lambda';

const UPLOAD_DIAMOND_METADATA_ARN =
  'arn:aws:lambda:us-west-1:433526169065:function:uploadDiamondMetadata';

export async function invokeLambda(payload: {
  tokenAccount: string;
  metadata: any;
}) {
  const input = {
    FunctionName: UPLOAD_DIAMOND_METADATA_ARN,
    InvocationType: InvocationType.Event,
    Payload: Buffer.from(JSON.stringify(payload)),
  };
  const client = new LambdaClient({
    region: 'us-west-1',
    credentials: {
      accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY!,
    },
  });
  const command = new InvokeCommand(input);
  try {
    await client.send(command);
  } catch (err) {
    console.error(err);
  }
}
