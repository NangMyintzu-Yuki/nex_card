import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.R2_PUBLIC_URL!;
const TEST_KEY = "test-r2-connection.txt";
const TEST_CONTENT = `R2 connection test - ${new Date().toISOString()}`;

async function test() {
  console.log("🔗 Testing R2 connection...");
  console.log(`   Bucket: ${BUCKET}`);
  console.log(`   Endpoint: https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  console.log(`   Public URL: ${PUBLIC_URL}`);
  console.log("");

  // 1. Upload
  console.log("📤 Uploading test file...");
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: TEST_KEY,
      Body: TEST_CONTENT,
      ContentType: "text/plain",
    })
  );
  console.log("   ✅ Upload success!");
  console.log(`   URL: ${PUBLIC_URL}/${TEST_KEY}`);
  console.log("");

  // 2. Read back
  console.log("📥 Reading file back...");
  const res = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: TEST_KEY,
    })
  );
  const body = await res.Body!.transformToString();
  console.log(`   Content: ${body}`);
  console.log("   ✅ Read success!");
  console.log("");

  // 3. Delete
  console.log("🗑️  Deleting test file...");
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: TEST_KEY,
    })
  );
  console.log("   ✅ Delete success!");
  console.log("");

  console.log("🎉 R2 is fully working!");
  console.log(`   Open to verify: ${PUBLIC_URL}/${TEST_KEY} (should 404 after delete)`);
}

test().catch((err) => {
  console.error("❌ R2 test failed:", err.message);
  process.exit(1);
});
