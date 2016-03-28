///<reference path="./typings.d.ts"/>

import * as sass from 'node-sass';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import * as postcss from 'postcss';
import * as autoprefixer from 'autoprefixer';
import * as cssnano from 'cssnano';
import {ncp} from 'ncp';

interface StylesConfig {
  src: string;
  out: string;
};

export function buildStyles(options: StylesConfig): void {
  const {src, out} = options;
  const scssFiles = path.join(src, '!(+(_))*.scss');
  glob(scssFiles, (err, scss) => {
    if (err) {
      return console.log(`failed to compile scss in ${src}: ${err}`);
    }

    scss.forEach(f => compileScss(f, out));
  });

  copyOcticons(out);
}

function compileScss(file: string, out: string) {
  console.log(`[scss]: ${file}`);

  const basename = path.basename(file, '.scss');
  const outputFile = path.join(out, `${basename}.css`);

  sass.render({
    file,
    sourceMap: false
  }, (err, result) => {
    if (err) {
      return console.log(`failed to compile ${file}: ${err}`);
    }

    const css = result.css.toString();

    postcss([autoprefixer({browsers: ['last 2 versions']}), cssnano])
      .process(css)
      .then(postResult => {
        postResult.warnings().forEach(warn => {
            console.warn(warn.toString());
        });

        fs.writeFile(outputFile, postResult.css.toString(), werr => {
          if (werr) {
            console.log(`faile to write css file: ${outputFile}: ${werr}`);
          }
        });
      });
  });
}

function copyOcticons(out) {
  const iconName = 'octicons';
  const iconFiles = ['woff', 'ttf', 'eot', 'svg'];
  iconFiles.forEach(suffix => {
    const filename = `${iconName}.${suffix}`;
    ncp(path.join('node_modules/octicons/octicons', filename),
    path.join(out, filename), err => {
      if (err) {
        return console.error(`failed to copy octicon: ${filename}`);
      }
    });
  });
}
