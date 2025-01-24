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

  const bucketName = "djergiantestbucket";
  const getObjectParams = {
    Bucket: bucketName,
    Key: "guitar.png",
  };

  const command = new GetObjectCommand(getObjectParams);
  const signedUrl = await getSignedUrl(s3, command, { expiresIn: 10 });
  console.log("signedUrl", signedUrl);

  return NextResponse.json({ url: signedUrl });
}

// export async function GET(req: NextRequest) {
//   // Set up AWS configuration to your account
//   aws.config.update({
//     accessKeyId: TOM_PUBLIC_KEY,
//     secretAccessKey: TOM_SECRET_KEY,
//     region: "us-west-2",
//   });

//   //start an s3 instance
//   const s3 = new aws.S3();

//   //get the object from the bucket, this will be in the form of a buffer
//   const data = await s3
//     .getObject({
//       Bucket: "djergiantestbucket",
//       Key: "guitar.png",
//     })
//     .promise();

//   //convert the buffer to a base64 string
//   let buffer = data.Body.toString("base64");
//   console.log("buffer", buffer);

//   //return the base64 string to the client
//   return NextResponse.json({ imgbase64: buffer });
// }
