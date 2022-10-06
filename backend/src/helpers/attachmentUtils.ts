import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { S3 } from 'aws-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils {
  constructor(private readonly s3: S3 = createS3Client(),
              private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
              private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION) {
  }

  async createAttachmentPresignedUrl(todoId: string) {
    return this.s3.getSignedUrl('PutObject', {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: this.urlExpiration
    })
  }
}

function createS3Client() {
  return new XAWS.S3({
    signatureVersion: 'v4'
  })
}