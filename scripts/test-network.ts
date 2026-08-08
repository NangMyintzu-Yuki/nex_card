import https from "node:https";

function testUrl(label: string, url: string) {
  return new Promise<void>((resolve) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      console.log(`✅ ${label}: ${res.statusCode}`);
      res.resume();
      resolve();
    });
    req.on("error", (err) => {
      console.error(`❌ ${label}: ${(err as any).code || err.message}`);
      resolve();
    });
    req.on("timeout", () => {
      console.error(`❌ ${label}: TIMEOUT`);
      req.destroy();
      resolve();
    });
  });
}

async function main() {
  console.log("Testing connectivity...\n");
  await testUrl("Google", "https://www.google.com");
  await testUrl("Cloudflare", "https://www.cloudflare.com");
  await testUrl("Cloudflare R2", `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
  await testUrl("AWS S3", "https://s3.amazonaws.com");
}

main();
