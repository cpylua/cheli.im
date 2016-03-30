///<reference path="./typings.d.ts"/>

import {build} from './site';
import {buildStyles} from './styles';
const config = require('../config.json');

import rimraf = require('rimraf');
import * as path from 'path';
import mkdirp = require('mkdirp');

function main() {
  const out = config.public;
  const cssDir = path.join(out, 'css');
  const postDir = path.join(out, 'post');

  rimraf(path.join(out, 'css'), err => {
    if (err) {
      return console.log(err);
    }

    mkdirp(postDir, error => {
      if (error) {
        return console.log(error);
      }

      build({
        src: config.posts,
        out
      });
    });

    mkdirp(cssDir, error => {
      if (error) {
        return console.log(error);
      }

      buildStyles({
        src: 'scss',
        out: cssDir
      });
    });
  });
}

main();
