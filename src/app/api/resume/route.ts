import aws from "aws-sdk";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const TOM_PUBLIC_KEY = process.env.TOM_PUBLIC_KEY;
const TOM_SECRET_KEY = process.env.TOM_SECRET_KEY;

export async function GET(req: NextRequest) {
  const s3 = new S3Client({
    region: "us-west-2",
    credentials: {
      accessKeyId: TOM_PUBLIC_KEY,
      secretAccessKey: TOM_SECRET_KEY,
    },
  });

  const bucketName = "griffinmoede.com";
  const getObjectParams = {
    Bucket: bucketName,
    Key: "resumes/GriffinMoede2025Resume.pdf",
  };

  const command = new GetObjectCommand(getObjectParams);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 10 });
  console.log("signedUrl", signedUrl);

  return NextResponse.json({ resumeURL: signedUrl });
}
