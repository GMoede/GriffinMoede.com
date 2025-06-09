import { NextResponse, NextRequest } from "next/server";
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(req: NextRequest) {
  const s3 = new S3Client({ region: "us-west-2" });

  const bucketName = "confirmation-wallet-photos";

  const getObjectParams = {
    Bucket: bucketName,
    Key: "IMG_0090.jpeg",
  };

  const command = new GetObjectCommand(getObjectParams);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 30 });

  return NextResponse.json({ url: signedUrl });
}
