///<reference path="./typings.d.ts"/>

import checksum = require('checksum');
import * as fs from 'fs';
import * as path from 'path';

const appConfig = require('../config.json');

const checksumFileName = `.resource_checksum_${appConfig.public}`;

export function load(resPath: string): Promise<CheckSumMap> {
  const filename = path.join(resPath, checksumFileName);

  return new Promise((resolve, reject) => {
    fs.stat(filename, (err, stats) => {
      if (err) {
        return resolve({});
      }

      if (!stats.isFile()) {
        return reject(`${checksumFileName} is not a file`);
      }

      fs.readFile(filename, (readError, data) => {
        if (readError) {
          return reject(`failed to read ${filename}: ${readError}`);
        }

        try {
          resolve(JSON.parse(data.toString()));
        } catch (ex) {
          console.error(`failed to parse checksum file: ${ex}`);
          resolve({});
        }
      });
    });
  });
}

export function save(checksums: CheckSumMap, resPath: string): void {
  const filename = path.join(resPath, checksumFileName);

  try {
    const checksumString = JSON.stringify(checksums);

    fs.writeFile(filename, checksumString, writeError => {
      if (writeError) {
        throw writeError;
      }
    });
  } catch (ex) {
    console.error(`failed to save checksum ${ex}`);
  }
}

// Returns true if checksum diffs from previous value.
// `checksums` will be mutated in this case.
export function update(checksums: CheckSumMap, filename: string, content: string): boolean {
  const newCheckSum = checksum(content, {algorithm: 'sha256'});
  if (checksums[filename] === newCheckSum) {
    return false;
  }

  checksums[filename] = newCheckSum;
  return true;
}
