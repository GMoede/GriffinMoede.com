import aws from "aws-sdk";
import {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const TOM_PUBLIC_KEY = process.env.TOM_PUBLIC_KEY;
const TOM_SECRET_KEY = process.env.TOM_SECRET_KEY;

export async function GET(req: NextRequest, res: NextResponse) {
  const s3 = new S3Client({
    region: "us-west-2",
    credentials: {
      accessKeyId: TOM_PUBLIC_KEY,
      secretAccessKey: TOM_SECRET_KEY,
    },
  });

  const bucketName = "griffinmoede.com";

  const listObjectsV2Params = {
    Bucket: bucketName,
    Prefix: "galleryImages/finalGalleryImages/",
  };

  const listCommand = new ListObjectsV2Command(listObjectsV2Params);
  const listResponse = await s3.send(listCommand);
  // console.log("listResponse", listResponse);

  const allObjects = [];

  if (listResponse.Contents) {
    for (const item of listResponse.Contents) {
      if (item.Key) {
        // console.log("item :", item);
        const getObjectParams = {
          Bucket: bucketName,
          Key: item.Key,
        };

        const command = new GetObjectCommand(getObjectParams);
        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 30 });

        if (item.Key.endsWith(".jpg") || item.Key.endsWith(".png")) {
          allObjects.push({
            key: item.Key,
            url: signedUrl,
          });
        }
      }
    }
  }

  return NextResponse.json(
    { pictures: allObjects },
    {
      status: 200, // Explicitly set status code
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache", // For HTTP/1.0 compatibility
        Expires: "0", // For HTTP/1.0 compatibility
      },
    }
  );
}
