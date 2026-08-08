import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestHandler: {
    httpsAgent: undefined,
  },
});

async function test() {
  console.log("Testing R2 connection...");
  console.log(`Endpoint: https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  console.log(`Bucket: ${process.env.R2_BUCKET_NAME}`);
  console.log(`Access Key: ${process.env.R2_ACCESS_KEY_ID?.substring(0, 8)}...`);
  console.log("");

  try {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME,
        MaxKeys: 5,
      })
    );
    console.log("✅ Connection success!");
    console.log(`Objects in bucket: ${res.KeyCount ?? 0}`);
    if (res.Contents?.length) {
      res.Contents.forEach((obj) => console.log(`  - ${obj.Key} (${obj.Size} bytes)`));
    }
  } catch (err: any) {
    console.error("❌ Error:", err.name, err.message);
    if (err.$metadata) {
      console.error("   HTTP Status:", err.$metadata.httpStatusCode);
    }
  }
}

test();
