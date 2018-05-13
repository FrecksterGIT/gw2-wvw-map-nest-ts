/* tslint:disable no-string-literal */

import * as fs from 'fs';
import * as path from 'path';
import pjson = require('pjson');

const pkg = {
  dependencies: pjson.dependencies,
  name: pjson.name + '-dist',
  scripts: {
    start: 'node ./main'
  },
  version: pjson.version
};

const filePath = path.join(__dirname, '../dist/package.json');
fs.writeFileSync(filePath, JSON.stringify(pkg));
