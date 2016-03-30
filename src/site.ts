///<reference path="./typings.d.ts"/>

import * as glob from 'glob';
import * as path from 'path';
import * as fs from 'fs';

import {render} from './post';
import * as archives from './archives';
import {minifyHtml} from './minify-html';
import * as checksum from './checksum';
const globalConfig = require('../config.json');

interface BuildConfig {
  src: string;
  out: string;
}

export function build(config: BuildConfig): void {
  const {src, out} = config;
  const posts = path.join(src, '**/*.@(md|ft)');
  const postMetadata: PostMetaData[] = [];

  checksum.load(src)
    .then(checksumMap => {
      glob(posts, (err, markdownFiles) => {
        markdownFiles.forEach((file, i) => {
          fs.readFile(file, (readError, data) => {
            try {
              if (readError) {
                return console.error(`failed to read post: ${file}: ${readError}`);
              }

              const content = data.toString();
              const meta = parseFileMetaData(content);
              if (!meta) {
                return console.log(`failed to parse meta data for post ${file}`);
              }

              archives.add(meta);

              const basename = path.basename(file);
              if (!checksum.update(checksumMap, basename, content)) {
                return console.log(`[unchanged] ${file}`);
              }
              postMetadata.push(meta);
            } finally {
              // read all meta data first, then render
              if (i === markdownFiles.length - 1) {
                archives.buildIndex(out);
                postMetadata.forEach(postMeta => compileFile(postMeta, out));
                checksum.save(checksumMap, src);
              }
            }
          });
        });
      });
    })
    .catch(error => {
      console.error(error);
    });
}

function compileFile(post: PostMetaData, out: string): void {
  if (post.draft) {
    return removeDraft(post, out);
  }

  render(post, {token: globalConfig.token})
    .then(html => {
      const outFile = path.join(out, 'post', `${post.url}.html`);
      fs.writeFile(outFile, minifyHtml(html), error => {
        if (error) {
          console.log(`failed to write output to ${outFile}: ${error}`);
        }
      });
    })
    .catch(renderErr => {
      console.error(`failed to render post: ${renderErr}`);
    });
}

// Meta data ends with a line containing only `;;;`
function parseFileMetaData(fileContent: string): PostMetaData {
  const lines = fileContent.split(/\r\n|\r|\n/);
  const metaEnding = ';;;';
  const endOfMetaData = lines.indexOf(metaEnding);
  if (endOfMetaData === -1) {
    return null;
  }

  try {
    const json = lines.slice(0, endOfMetaData).join(',\n');
    const meta: PostMetaData = JSON.parse(`{${json}}`);
    const markdown = lines.slice(endOfMetaData + 1).join('\n');
    meta.markdown = markdown;

    // generate a default url
    if (!meta.url) {
      meta.url = titleToUrl(meta.title);
    }

    if (!meta.author) {
      meta.author = globalConfig.author;
    }

    return meta;
  } catch (ex) {
    return null;
  }
}

function titleToUrl(title: string) {
  return title.replace(/[^A-Za-z0-9-]/gi, '-').toLowerCase();
}

function removeDraft(post: PostMetaData, out: string): void {
  const draftFile = path.join(out, 'post', `${post.url}.html`);
  fs.stat(draftFile, (err, stats) => {
    if (!err && stats.isFile()) {
      fs.unlink(draftFile, unlinkError => {
        if (unlinkError) {
          return console.error(`failed to remove draft file: ${draftFile}`);
        }

        return console.log(`[draft]:[removed]: ${post.title}`);
      });
    } else {
      return console.log(`[draft]:[skipped]: ${post.title}`);
    }
  });
}
