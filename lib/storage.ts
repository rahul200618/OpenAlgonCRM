import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.R2_ENDPOINT) throw new Error("R2_ENDPOINT is not defined");
if (!process.env.R2_ACCESS_KEY) throw new Error("R2_ACCESS_KEY is not defined");
if (!process.env.R2_SECRET_KEY) throw new Error("R2_SECRET_KEY is not defined");
if (!process.env.R2_BUCKET) throw new Error("R2_BUCKET is not defined");

export const storageClient = new S3Client({
  endpoint: process.env.R2_ENDPOINT,
  region: "us-east-1", // Cloudflare R2 requires a region value; actual value doesn't matter
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
  forcePathStyle: true, // REQUIRED for Cloudflare R2 — without this, SDK uses virtual-hosted-style which breaks
});

export const R2_BUCKET = process.env.R2_BUCKET;
export const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_ENDPOINT;
