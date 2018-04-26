import {resolve} from 'path';

export class Config {
  public static readonly viewDirectory: string = resolve(__dirname + '/views');
  public static readonly layoutsDirectory: string = resolve(__dirname + '/views/layouts');

  public static readonly publicDirectory: string = (() => {
    if (process.env.NODE_ENV === 'development') {
      return resolve(__dirname + '/../dist/public');
    }
    else {
      return resolve(__dirname + '/public');
    }
  })();
}
