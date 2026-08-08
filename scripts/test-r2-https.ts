import https from "node:https";

const accountId = process.env.R2_ACCOUNT_ID!;
const bucket = process.env.R2_BUCKET_NAME!;
const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;

console.log(`Testing direct HTTPS to: ${endpoint}`);

const req = https.get(endpoint, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    console.log(`Response (first 500 chars): ${body.substring(0, 500)}`);
  });
});

req.on("error", (err) => {
  console.error(`❌ Connection error: ${err.message}`);
  console.error(`   Code: ${(err as any).code}`);
});

req.setTimeout(15000, () => {
  console.error("❌ Request timed out after 15s");
  req.destroy();
});
