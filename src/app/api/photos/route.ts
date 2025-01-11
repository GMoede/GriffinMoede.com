import aws from "aws-sdk";
import { NextRequest, NextResponse } from "next/server";

const TOM_PUBLIC_KEY = process.env.TOM_PUBLIC_KEY;
const TOM_SECRET_KEY = process.env.TOM_SECRET_KEY;

export async function GET(req: NextRequest) {
  // Set up AWS configuration to your account
  aws.config.update({
    accessKeyId: TOM_PUBLIC_KEY,
    secretAccessKey: TOM_SECRET_KEY,
    region: "us-west-2",
  });

  //start an s3 instance
  const s3 = new aws.S3();

  //get the object from the bucket, this will be in the form of a buffer
  const data = await s3
    .getObject({
      Bucket: "djergiantestbucket",
      Key: "guitar.png",
    })
    .promise();

  //convert the buffer to a base64 string
  let buffer = data.Body.toString("base64");
  console.log("buffer", buffer);

  //return the base64 string to the client
  return NextResponse.json({ imgbase64: buffer });
}
