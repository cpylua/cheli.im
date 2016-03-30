///<reference path="./typings.d.ts"/>

import * as path from 'path';
import * as fs from 'fs';
import * as statics from './renderStatic';
import {minifyHtml} from './minify-html';

const posts: PostMetaData[] = [];
const blacklist = ['404', '50x', 'about'];

export function add(post: PostMetaData): void {
  if (post.draft) {
    return;
  }

  // Do not generate index for pages in blacklist
  if (blacklist.indexOf(post.title) !== -1) {
    return;
  }

  posts.push(post);
}

export function buildIndex(out: string): void {
  const indexFile = path.join(out, 'index.html');
  const styles = '<link rel="stylesheet" href="css/archives.css" />';
  const indexContent = `
${statics.renderHeader({
  title: 'archives',
  resources: styles
})}
${renderArchive(posts)}
${statics.renderFooter({noArchiveLink: true})}
`;

  console.log(`[archive]: ${indexFile}`);
  fs.writeFile(indexFile, minifyHtml(indexContent), err => {
    if (err) {
      return console.log(`failed to build archive index: ${err}`);
    }
  });
}

function renderArchive(archives: PostMetaData[]): string {
  sortPosts(archives);
  const items = archives.map(renderArchiveItem).join('\n');
  return `
<div class="title">Archives</div>
<div class="archives">
  ${items}
</div>
`;
}

function renderArchiveItem(post: PostMetaData): string {
  return `
<div class="post">
  <a href="post/${post.url}" class="archive-link">${post.title}</a>
  <span class="archive-date">${post.date}</span>
</div>
`;
}

// sort by date then title, from new to old
function sortPosts(archives: PostMetaData[]): PostMetaData[] {
  posts.sort((a, b) => {
    const ad = parseDate(a.date);
    const bd = parseDate(b.date);
    if (ad < bd) {
      return 1;
    } else if (ad > bd) {
      return -1;
    } else {
      const at = a.title;
      const bt = b.title;
      return at < bt ? 1 : (at > bt ? -1 : 0);
    }
  });

  return posts;
}

function parseDate(date: string): Date {
  const dateParts = date.split('-');
  const datePartsInNumber = dateParts.map(f => parseInt(f, 10));
  const [y, m, d] = datePartsInNumber;
  return new Date(y, m - 1, d);
}
