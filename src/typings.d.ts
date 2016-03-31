///<reference path="../node_modules/typescript/lib/lib.es6.d.ts"/>
///<reference path="../typings/main.d.ts"/>

interface PostMetaData {
  title: string;
  date: string;
  markdown: string;
  author: string;
  draft?: boolean;
  updated?: string;
  url?: string;
}

interface CheckSumMap {
  [filename: string]: string;
}

// Type definitions for Autoprefixer Core 5.1.11
// Project: https://github.com/postcss/autoprefixer-core
// Definitions by: Asana <https://asana.com>
declare module 'autoprefixer' {
    interface Config {
        browsers?: string[];
        cascade?: boolean;
        remove?: boolean;
    }

    interface Options {
        from?: string;
        to?: string;
        safe?: boolean;
        map?: {
            inline?: boolean;
            prev?: string | Object;
        };
    }

    interface Result {
        css: string;
        map: string;
        opts: Options;
    }

    interface Processor {
        postcss: any;
        info(): string;
        process(css: string, opts?: Options): Result;
    }

    interface Exports {
        (config: Config): Processor;
        postcss: any;
        info(): string;
        process(css: string, opts?: Options): Result;
    }

    let exports: Exports;
    export = exports;
}

declare module 'cssnano' {
  let exports: any;
  export = exports;
}

// FIXME: postcss d.ts is broken with noImplicitAny: true
declare module 'postcss' {
  let exports: any;
  export = exports;
}
