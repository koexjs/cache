import { Context } from 'koa';
import LRU, { LRU as ILRU} from '@zcorky/lru';
import { undefined as isUndefined, string as isString } from '@zcorky/is';

export type DB<K, V> = {
  get(key: K): V | Promise<V>;
  set(key: K, value: V): void | Promise<void>
  [key: string]: any;
} & ILRU<K, V>;
export interface Options {
  key?: keyof Context & string | ((ctx: Context) => string);
  max?: number;
  db?: DB<string, Cached>;
}

export interface Cached {
  body: any;
  type: string;
  lastModified: string;
  etag: string;
};

const creatCacheHits = (options?: Options) => {
  const _options = options || {};
  const getKey = isUndefined(_options.key)
    ? (ctx: Context) => ctx.originalUrl || ctx.url
    : isString(_options.key)
      ? (ctx: Context) => ctx[_options.key as any] as string
      : _options.key;

  const max = _options.max || 100;
  const db = _options.db || new LRU<string, Cached>(max);

  return async function koaCacheHit (ctx: Context, next: () => Promise<any>) {
    if (ctx.method !== 'GET') {
      return next();
    }

    const key = getKey(ctx);
    const cached = await db.get(key);

    if (cached) {
      const hits = db.hits();
      ctx.set('X-Cache-Hits', `rate=${(hits.rate * 100).toFixed(2)}%`);

      ctx.set('Content-Type', cached.type);
      ctx.set('Last-Modified', cached.type);
      ctx.set('etag', cached.type);

      ctx.status = 200;
      ctx.body = cached.body;
      return;
    }

    await next();

    // only cache GET/HEAD 200 and have body
    if (ctx.method !== 'GET' && ctx.method !== 'HEAD') return ;
    if (ctx.status !== 200) return ;
    if (!ctx.body) return ;

    const data = {
      body: ctx.body,
      type: ctx.response.get('Content-Type'),
      lastModified: ctx.response.get('Last-Modified'),
      etag: ctx.response.get('etag'),
    };

    await db.set(key, data);
  };
}

export {
  creatCacheHits,
};

export default creatCacheHits;
