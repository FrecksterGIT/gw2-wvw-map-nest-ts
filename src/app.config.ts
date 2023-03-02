import {resolve} from 'path';

export class Config {
  public static readonly viewDirectory: string = process.env.NODE_ENV === 'development' ? resolve(__dirname + '/views') : resolve(__dirname + '/dist/views');
  public static readonly layoutsDirectory: string = process.env.NODE_ENV === 'development' ? resolve(__dirname + '/views/layouts') : resolve(__dirname + '/dist/views/layouts');

  public static readonly publicDirectory: string = (() => {
    if (process.env.NODE_ENV === 'development') {
      return resolve(__dirname + '/../dist/public');
    }
    else {
      return resolve(__dirname + '/public');
    }
  })();
}
