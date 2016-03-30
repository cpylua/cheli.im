const appConfig = require('../config.json');

interface HeaderConfig {
  title: string;
  resources?: string;
}

interface FooterConfig {
}

export function renderHeader(config: HeaderConfig): string {
  const {title, resources} = config;
  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset='utf-8'>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta http-equiv="Content-Language" content="en">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${resources ? resources : ''}
    <title>${title}</title>
  </head>
  <body>
`;
}

export function renderFooter(config: FooterConfig = {}): string {
  return `
    <div class="footer">
      <a href="/" class="ft-link">/index</a>
      <a href="/post/about" class="ft-link">/about</a>
    </div>
    ${renderGA(appConfig.ga)}
  </body>
</html>
`;
}

export function renderGA(ga: string): string {
  return `
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', '${ga}', 'auto');
  ga('send', 'pageview');

</script>
`;
}
