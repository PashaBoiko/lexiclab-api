import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage';

const s3Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

class S3UploadService {
  constructor() {}

  static async upload(params) {
    try {
      const parallelUploads3 = new Upload({
        client: s3Client,
        params: params,
      });

      return await parallelUploads3.done();
    } catch (err) {
      throw err;
    }
  };

  static async delete(params) {
    try {
      if (!(params.Bucket && params.Key))
        throw Error("[S3UploadService]: The Bucket or Key parameters are missed ");

      const command = new DeleteObjectCommand(params);

      return await s3Client.send(command);

    } catch (err) {
      throw err;
    }
  }
}

export default S3UploadService;