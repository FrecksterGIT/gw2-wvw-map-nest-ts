import * as fs from 'fs';
import mkdirp = require('mkdirp');
import * as path from 'path';
import {promisify} from 'util';
import ICache from '../interfaces/cache.interface';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export default class FileCache implements ICache {

  private path: string = './_cache/';

  public async get(key: string): Promise<any> {
    const filePath = this.getFilePath(key);
    if (fs.existsSync(filePath)) {
      return readFile(filePath);
    }
    return null;
  }

  public async set(key: string, value: any, cacheTime: number) {
    return new Promise<void>((resolve) => {
      const filePath: string = this.getFilePath(key);
      const stream = fs.createWriteStream(filePath);
      stream.on('open', () => {
        stream.write(value);
        stream.end();
      });
      stream.on('finish', () => {
        resolve();
      });
    });
  }

  public remove(key: string): void {
    const filePath: string = this.getFilePath(key);
    unlink(filePath);
  }

  private getFilePath(key: string): string {
    mkdirp.sync(this.path);
    return path.join(this.path, key);
  }
}
