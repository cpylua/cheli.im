///<reference path="./typings.d.ts"/>

import 'isomorphic-fetch';

const GITHUB_API = 'https://api.github.com/markdown';

export function renderMarkdown(markdown: string, token = ''): Promise<string> {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Accept', 'application/vnd.github.v3+json');

  // If token is not specified, the api can still be called but with a rate
  // limit of 60/hour.
  if (token) {
    headers.append('Authorization', `token ${token}`);
  }

  const responsePromise = fetch(GITHUB_API, {
    method: 'post',
    headers,
    body: JSON.stringify({
      text: markdown,
      mode: 'markdown' // the same as github README
    })
  });

  return responsePromise.then((response: IResponse) => {
    if (response.status === 200) {
      return response.text();
    }

    throw new Error('failed to render markdown with github api');
  });
}
