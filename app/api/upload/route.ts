import S3 from "@/app/libs/s3";

export async function POST(request: Request) {
  // Return 204 No Content
  // Parse form data
  const formData = await request.formData();
  const blobData = formData.get("image_single") as Blob;
  const arrayBuffer = await blobData?.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: blobData.name,
    ContentType: blobData.type,
    Body: buffer,
  };

  const data = await new S3().upload(params);

  return new Response(
    JSON.stringify({
      message: "Image uploaded successfully",
      data: {
        url: data.Location,
      },
    }),
    { status: 200 }
  );
}
