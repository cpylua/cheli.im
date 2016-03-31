Static site generator for [cheli.im](http://cheli.im)
====

Self hosted github `README`s with incremental build.

Why
-----

Well... I did look into some popular projects written in JavaScript, like Hexo
and wintersmith. Personally I'm not a fan of Hexo.

Those left are wintersmith like minimum frameworks, then I thought if I can code
it in one day why bother spending half a day to learn a framework just to start
coding?

How
----

This project is inspired by [Github Flavored Markdown Server](https://github.com/youurayy/gfms).
The idea is to use github's markdown rendering API to render posts into html.

What about styles? It turns out github has open sourced its css framework:
[Primer](https://github.com/primer/primer), [Primer markdown](https://github.com/primer/markdown)
and [Octicons](https://github.com/github/octicons/).

The generated site is just a bunch of github readme like pages along with an
archive page which list all available pages.


Install
----

1. Install `node` > 4
2. Install `typings`: `npm install -g typings`
3. `git clone` this repository
4. `npm install`
5. `typings install`
6. Add a `config.json` file in the root directory
7. `npm run build` && `npm run make`

config.json
----

Create it in project root.

`posts` the root directory of your posts.

`public`: the root directory of all generated files.

`token` is your github api token,you can generate one in your github settings
page. You don't have to grant any special permissions to this token, it won't
read you profile or repositories. It's better to set your own token, but it will
work if you leave it blank(with a very low rate limit to the apis).

`author` is the default author name used in post. You may override it in
individual posts.

`ga` google analytics code

Usage
----

Write your posts in markdown and put them in your `posts` folder.

Compiled files will be sent to `public` folder. It will be automatically created
for you when run `npm run make`. Folder structure for public.

```
public
├── css
│   ├── archives.css
│   ├── octicons.eot
│   ├── octicons.svg
│   ├── octicons.ttf
│   ├── octicons.woff
│   └── post.css
├── index.html
└── post
    ├── foobar.html
    └── quux.html
```

Styles are written in `scss`. Markdown styling and icons are from github.

Meta data in post file: `title`, `date`, `updated`, `draft`.

```
"title": "About Me"
"date": "2012-10-15"
"updated": "2015-10-28"
"draft": true
;;;

// the line with `;;;` is required to mark the end of meta data.
```

Mark a file as draft will remove it from public directory.

If incremental build is not working properly, try remove `.resource_checksum_****`
files in `scss` folder and your post source directory.

Customize
-----

Modify the code, there's not much configuration exposed.

It's a quick dirty project for personal use, forks are welcome but no feature request
please.

License
----

MIT
