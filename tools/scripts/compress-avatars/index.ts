import {
  S3Client,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { PrismaClient, User } from '@prisma/client'

async function compressAvatars() {
  const accessKeyId = process.env.AWS_ACCESS_KEY;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET;
  const endpoint = process.env.AWS_S3_ENDPOINT;
  const region = process.env.AWS_REGION ?? 'us-east-1';

  if (!accessKeyId || !secretAccessKey || !bucket || !endpoint) {
    throw new Error(
      'AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET, and AWS_S3_ENDPOINT must be set',
    );
  }

  const s3 = new S3Client({
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    region,
  });

  const prisma = new PrismaClient();

  await prisma.$connect();

  const take = 100;
  let skip = 0;
  let users: User[] = [];

  do {
    users = await prisma.user.findMany({ take, skip });
    skip += users.length;

    for (const user of users) {
      const avatarKeys = user.avatarKeys as string[];

      if (!avatarKeys.length) continue;

      for (const avatarKey of avatarKeys) {
        try {
          console.log({
            Bucket: bucket,
            Key: avatarKey,
          });

          const command = new GetObjectCommand({
            Bucket: bucket,
            Key: avatarKey,
          });
          
          const output = await s3.send(command);
          
          console.log(output.Body);
        } catch (error: any) {
          console.dir(error.body, { depth: 4 });
        }
      }
    }

  } while(users.length !== 0);

  await prisma.$disconnect();
}

compressAvatars();
