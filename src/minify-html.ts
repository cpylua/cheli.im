///<reference path="./typings.d.ts"/>

import {minify as htmlMinify} from 'html-minifier';

export function minifyHtml(html: string) {
  return htmlMinify(html, {
    removeComments: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    collapseWhitespace: true,
    minifyJS: true,
    minifyCSS: true
  });
}
