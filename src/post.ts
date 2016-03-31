///<reference path="./typings.d.ts"/>

import {renderMarkdown} from './renderMarkdown';
import * as templates from './renderStatic';

interface RenderOption {
  token?: string;
}

export function render(post: PostMetaData, options: RenderOption = {}): Promise<string> {
  const {token} = options;
  const {title, markdown} = post;

  return renderMarkdown(markdown, token)
    .then(html => {
      const header = templates.renderHeader({
        title,
        resources: `<link rel="stylesheet" href="../css/post.css"/>`
      });
      const footer = templates.renderFooter();
      html = renderPost(html, post);

      console.log(`[post]:[rendered]:${title}`);
      return [header, html, footer].join('\n');
    });
}


function renderPost(content: string, post: PostMetaData): string {
  return `
<div class="post">
  <div class="markdown-body">${content}</div>

  <div class="post-info">
    <span class="pi-author">${post.author}</span>
    <span class="pi-date">${post.date}</span>${post.updated ? `<span class="pi-update">, updated at ${post.updated}</span>` : ''}
  </div>
  <div class="post-eof"></div>
</div>
`;
}
