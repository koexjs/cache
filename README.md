# cache

[![NPM version](https://img.shields.io/npm/v/@koex/koa-cache-hits.svg?style=flat)](https://www.npmjs.com/package/@koex/koa-cache-hits)
[![Coverage Status](https://img.shields.io/coveralls/koex/koa-cache-hits.svg?style=flat)](https://coveralls.io/r/koex/koa-cache-hits)
[![Dependencies](https://david-dm.org/@koex/koa-cache-hits/status.svg)](https://david-dm.org/@koex/koa-cache-hits)
[![Build Status](https://travis-ci.com/koex/koa-cache-hits.svg?branch=master)](https://travis-ci.com/koex/koa-cache-hits)
![license](https://img.shields.io/github/license/koex/koa-cache-hits.svg)
[![issues](https://img.shields.io/github/issues/koex/koa-cache-hits.svg)](https://github.com/koex/koa-cache-hits/issues)

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
