import log from 'debug';
import * as fs from 'fs';
import fetch from 'node-fetch';
import * as path from 'path';
import {URL} from 'url';

log.enable('fetch-emblem-resources');
const logger = log('fetch-emblem-resources');
const urls = ['https://api.guildwars2.com/v2/emblem/foregrounds?ids=all',
  'https://api.guildwars2.com/v2/emblem/foregrounds?ids=all'];

const imageUrls = [];

const readFile = (url): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => fetch(url)
      .then(async (res) => resolve(res)), 10);
  });
};

const writeFile = async (url, res) => {
  const u = new URL(url).pathname;
  const file = u.substring(u.lastIndexOf('/') + 1, u.length);
  const filePath = path.join(__dirname, '../src/assets/emblem_base/' + file);
  logger('writeFile' + file);
  if (res.ok) {
    const dest = fs.createWriteStream(filePath);
    await res.body.pipe(dest);
    return 'success: ' + url;
  } else {
    logger(res.status, res.statusText, JSON.stringify(res.headers));
  }
  return 'error: ' + url;
};

const handleFiles = async (result): Promise<string[]> => {
  const url = imageUrls.pop();
  if (url) {
    await readFile(url).then(async (res) => {
      await writeFile(url, res);
      result.push(url);
      return handleFiles(result);
    });
  }
  return result;
};

Promise.all(urls.map(async (url) => {
  return fetch(url).then(async (res) => {
    const data = await res.json();
    data.map((settings) => {
      imageUrls.push(...settings.layers);
    });
  });
})).then(() => {
  handleFiles([]).then((res) => {
    res.forEach((result) => logger(result.length));
  });
});
