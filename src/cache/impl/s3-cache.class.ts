import {Logger} from '@nestjs/common';
import aws = require('aws-sdk');
import ICache from '../interfaces/cache.interface';

export default class S3Cache implements ICache {

  private bucketName: string = 'gw2-emblems';
  private client: aws.S3;
  private initialized: boolean = false;

  private setup() {
    if (!this.initialized) {
      aws.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        region: 'eu-central-1',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
      this.client = new aws.S3({params: {Bucket: this.bucketName}});
      this.initialized = true;
    }
  }

  public async get(key: string): Promise<any> {
    this.setup();
    return new Promise(async (resolve) => {
      this.client.headObject({Bucket: this.bucketName, Key: key}, (error) => {
        if (error) {
          resolve(null);
          return;
        }
        this.client.getObject({Bucket: this.bucketName, Key: key}, (err, content) => {
          if (err) {
            resolve(null);
            return;
          }
          resolve(content.Body);
        });
      });
    });
  }

  public async set(key: string, value: any, cacheTime: number): Promise<void> {
    return new Promise<void>((resolve) => {
      this.client.putObject({
        ACL: 'public-read',
        Body: value,
        Bucket: this.bucketName,
        Key: key
      }, (err) => {
        if (err) {
          Logger.error('S3 writing failed: ' + String(err));
        }
        resolve();
      });
    });
  }

  public remove(key: string): void {
    // noop
  }
}
