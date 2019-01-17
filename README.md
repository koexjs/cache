# cache

[![NPM version](https://img.shields.io/npm/v/@koex/cache.svg?style=flat)](https://www.npmjs.com/package/@koex/cache)
[![NPM quality](https://npm.packagequality.com/shield/%40koex%2Fcache.svg)](https://packagequality.com/#?package=@koex/cache)
[![Coverage Status](https://img.shields.io/codecov/c/github/koexjs/cache/master.svg?style=flat-square)](https://codecov.io/gh/koexjs/cache)
[![Dependencies](https://img.shields.io/david/koexjs/cache.svg?style=flat-square)](https://david-dm.org/koexjs/cache)
[![Build Status](https://travis-ci.com/koexjs/cache.svg?branch=master)](https://travis-ci.com/koexjs/cache)
[![Known Vulnerabilities](https://snyk.io/test/npm/@koex/cache/badge.svg?style=flat-square)](https://snyk.io/test/npm/@koex/cache)
[![NPM download](https://img.shields.io/npm/dm/@koex/cache.svg?style=flat-square)](https://www.npmjs.com/package/@koex/cache)
![license](https://img.shields.io/github/license/koexjs/cache.svg)
[![issues](https://img.shields.io/github/issues/koexjs/cache.svg)](https://github.com/koexjs/cache/issues)

> cache for koa extend. And you can custom auto cache db, like redis.

### Install

```
$ npm install @koex/cache
```

### Usage

```javascript
// See more in test
import cache from '@koex/cache';

import * as Koa from 'koa';
const app = new Koa();
app.use(cache(options));
app.use(async (ctx) => {
  if (ctx.path === '/') {
    ctx.body = 'hello, world';
  } else if (ctx.path === '/json') {
    ctx.body = {
      name: 'name',
      value: 'value',
    };
  }
});

app.listen(8000, '0.0.0.0', () => {
  console.log('koa server start');
});
```

### Related
* [cash](https://github.com/koajs/cash)
* [koa-cache-lite](https://github.com/mkozjak/koa-cache-lite)
* [rsshub/lru-cache](https://github.com/DIYgod/RSSHub/blob/master/middleware/lru-cache.js)
