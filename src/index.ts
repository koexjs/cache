import { Context } from 'koa';
import LRU, { LRU as ILRU} from '@zcorky/lru';
import { undefined as isUndefined, string as isString } from '@zcorky/is';

export type DB<K, V> = {
  get(key: K): V | Promise<V>;
  set(key: K, value: V): void | Promise<void>
  [key: string]: any;
} & ILRU<K, V>;
export interface Options<K, V> {
  key?: keyof Context & string | ((ctx: Context) => string);
  max?: number;
  db?: DB<K, V>;
}

const creatCacheHits = <V = any>(options?: Options<string, V>) => {
  const _options = options || {};
  const getKey = isUndefined(_options.key)
    ? (ctx: Context) => ctx.originalUrl || ctx.url
    : isString(_options.key)
      ? (ctx: Context) => ctx[_options.key as any] as string
      : _options.key;

  const max = _options.max || 100;
  const db = _options.db || new LRU<string, V>(max);

  return async function koaCacheHit (ctx: Context, next: () => Promise<any>) {
    if (ctx.method !== 'GET') {
      return next();
    }

    const key = getKey(ctx);
    const cached = await db.get(key);

    if (cached) {
      const hits = db.hits();
      ctx.set('X-Cache-Hits', `rate=${(hits.rate * 100).toFixed(2)}%`);
      ctx.status = 200;
      ctx.body = cached;
      return;
    }

    await next();

    const data = ctx.body;
    await db.set(key, data);
  };
}

export {
  creatCacheHits,
};

export default creatCacheHits;
