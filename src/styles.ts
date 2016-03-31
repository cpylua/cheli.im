///<reference path="./typings.d.ts"/>

import * as sass from 'node-sass';
import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';
import * as postcss from 'postcss';
import * as autoprefixer from 'autoprefixer';
import * as cssnano from 'cssnano';
import {ncp} from 'ncp';
import * as resourceChecksum from './checksum';
import checksum = require('checksum');

interface StylesConfig {
  src: string;
  out: string;
};

export function buildStyles(options: StylesConfig): void {
  const {src, out} = options;
  const scssFiles = path.join(src, '!(+(_))*.scss');

  const iconsPromise = copyOcticons(out);

  glob(scssFiles, (err, scss) => {
    if (err) {
      return console.log(`failed to compile scss in ${src}: ${err}`);
    }

    resourceChecksum.load(src).then(checksums => {
      const scssPromise = Promise.all(scss.map(f => compileScss(f, out, checksums)));

      Promise.all([iconsPromise, scssPromise])
        .then(() => {
          return removeCSSWithNoSCSS(scss, out, checksums);
        })
        .then(() => {
          resourceChecksum.save(checksums, src);
        })
        .catch(buildError => {
          console.error(buildError);
        });
    });
  });
}

function removeCSSWithNoSCSS(scssFiles: string[], cssRoot: string, checksums: CheckSumMap) {
  return new Promise((resolve, reject) => {
    glob(path.join(cssRoot, '*.css'), (err, cssFiles) => {
      const cssBaseNames = cssFiles.map(css => path.basename(css, '.css'));
      const scssBaseNames = scssFiles.map(scss => path.basename(scss, '.scss'));

      resolve(Promise.all(cssBaseNames.map((css, i) => {
        return new Promise((res, rej) => {
          if (scssBaseNames.indexOf(css) === -1) {
            const cssWithSuffix = `${css}.css`;
            console.log(`[css]:[remove]:${cssWithSuffix}`);
            fs.unlinkSync(cssFiles[i]);
            delete checksums[cssWithSuffix];
          }

          resolve();
        });
      })));
    });
  });
}

function compileScss(file: string, out: string, checksums: CheckSumMap): Promise<string> {
  const basename = path.basename(file, '.scss');
  const outputFile = path.join(out, `${basename}.css`);

  return new Promise((resolve, reject) => {
    sass.render({
      file,
      sourceMap: false
    }, (err, result) => {
      if (err) {
        return reject(`failed to compile ${file}: ${err}`);
      }

      const css = result.css.toString();

      postcss([autoprefixer({browsers: ['last 2 versions']}), cssnano])
        .process(css)
        .then(postResult => {
          postResult.warnings().forEach(warn => {
              console.warn(warn.toString());
          });

          // do not write to file if output is identical to previous version
          const productionCss = postResult.css.toString();
          if (resourceChecksum.update(checksums, path.basename(outputFile), productionCss)) {
            console.log(`[scss]:${file}`);

            fs.writeFile(outputFile, productionCss, werr => {
              if (werr) {
                return reject(`faile to write css file: ${outputFile}: ${werr}`);
              }

              resolve(`${file} compiled`);
            });
          } else {
            console.log(`[unchanged]:${file}`);
            resolve(`${file} unchanged`);
          }
        });
    });
  });
}

function copyOcticons(out) {
  const iconName = 'octicons';
  const iconFiles = ['woff', 'ttf', 'eot', 'svg'];

  return Promise.all(iconFiles.map((suffix, idx) => {
    const filename = `${iconName}.${suffix}`;
    const src = path.join('node_modules/octicons/octicons', filename);
    const dst = path.join(out, filename);

    return new Promise((resolve, reject) => {
      checksum.file(src, (srcErr, srcSum) => {
        if (srcErr) {
          return reject(`failed to calculate checksum for ${src}`);
        }

        checksum.file(dst, (dstErr, dstSum) => {
          if (srcSum === dstSum) {
            console.log(`[unchanged]:${filename}`);
            return resolve(`${filename} unchanged`);
          }

          // copy on error or checksum diffs
          ncp(src, dst, err => {
            if (err) {
              reject(`failed to copy octicon: ${filename}`);
            } else {
              console.log(`[icon]:${filename}`);
              resolve(`${filename} copied`);
            }
          });
        });
      });
    });
  }));
}
