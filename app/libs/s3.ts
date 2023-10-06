import EventEmitter from "eventemitter3";
import AWS from "./aws";

export default class S3 {
  private s3: AWS.S3;
  private bucketName: string;
  private eventEmitter: EventEmitter;

  constructor() {
    this.s3 = new AWS.S3();
    this.bucketName = process.env.AWS_BUCKET_NAME!;
    this.eventEmitter = new EventEmitter();
    this.eventEmitter.on(
      "upload",
      async ({ file, name }: { file: Blob; name: string }) => {
        const params = {
          Body: file,
          Key: name,
          ContentType: file.type,
        };

        try {
          await this.upload(params);
        } catch (error) {
          // TODO: Handle error
        }
      }
    );
  }

  uploadFile(file: Blob, name: string): string {
    this.eventEmitter.emit("upload", { file, name });

    return `/images/${name}`;
  }

  async upload(params: Omit<AWS.S3.PutObjectRequest, "Bucket">) {
    if (params.Body instanceof Blob) {
      const arrayBuffer = await params.Body.arrayBuffer();
      params.Body = Buffer.from(arrayBuffer);
      params.ACL = "public-read";
    }

    return this.s3
      .upload({
        ...params,
        Bucket: this.bucketName,
      })
      .promise();
  }

  async delete(params: Omit<AWS.S3.DeleteObjectRequest, "Bucket">) {
    return this.s3
      .deleteObject({
        ...params,
        Bucket: this.bucketName,
      })
      .promise();
  }
}
