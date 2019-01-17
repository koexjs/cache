# cache

[![NPM version](https://img.shields.io/npm/v/@koex/cache.svg?style=flat)](https://www.npmjs.com/package/@koex/cache)
[![Coverage Status](https://img.shields.io/coveralls/koex/cache.svg?style=flat)](https://coveralls.io/r/koex/cache)
[![Dependencies](https://david-dm.org/@koex/cache/status.svg)](https://david-dm.org/@koex/cache)
[![Build Status](https://travis-ci.com/koex/cache.svg?branch=master)](https://travis-ci.com/koex/cache)
![license](https://img.shields.io/github/license/koex/cache.svg)
[![issues](https://img.shields.io/github/issues/koex/cache.svg)](https://github.com/koex/cache/issues)

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
