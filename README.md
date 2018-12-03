# koa-cache-hits

[![NPM version](https://img.shields.io/npm/v/@zcorky/koa-cache-hits.svg?style=flat)](https://www.npmjs.com/package/@zcorky/koa-cache-hits)
[![Coverage Status](https://img.shields.io/coveralls/zcorky/koa-cache-hits.svg?style=flat)](https://coveralls.io/r/zcorky/koa-cache-hits)
[![Dependencies](https://david-dm.org/@zcorky/koa-cache-hits/status.svg)](https://david-dm.org/@zcorky/koa-cache-hits)
[![Build Status](https://travis-ci.com/zcorky/koa-cache-hits.svg?branch=master)](https://travis-ci.com/zcorky/koa-cache-hits)
![license](https://img.shields.io/github/license/zcorky/koa-cache-hits.svg)
[![issues](https://img.shields.io/github/issues/zcorky/koa-cache-hits.svg)](https://github.com/zcorky/koa-cache-hits/issues)

> Deep Diff & Patch in js, maybe data visition timeline json data is common for use.
> Diff => CREATE / UPDATE / DELETE / UNCHANGE Data.
> Patch => Immutable Philosophy Data.

### Install

```
$ npm install @zcorky/koa-cache-hits
```

### Usage

```javascript
// See more in test
import cache from '@zcorky/koa-cache-hits';

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