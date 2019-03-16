import { Context } from 'koa';
import LRU, { Hits } from '@zcorky/lru';
import { undefined as isUndefined, string as isString } from '@zcorky/is';

export interface Options {
  /**
   * A hash key function. default: (ctx: Context) => ctx.url.
   */
  key?: keyof Context & string | ((ctx: Context) => string);

  /**
   * Max db cache size for LRU. If use self db instance, it will be ignored.
   */
  max?: number;

  /**
   * Cache max age. default: 3600 (s);
   */
  maxAge?: number;

  /**
   * Get a value from store by key.
   *
   * @param key cache key
   * @param maxAge cache max age
   * @returns Promise<Cached>
   */
  get?(key: string, maxAge: number): Promise<Cached | undefined>;

  /**
   * Set a value to store.
   *
   * @param key cache key
   * @param value cache value
   * @param maxAge cache max age
   */
  set?(key: string, value: Cached, maxAge: number): Promise<void>

  /**
   * Hit cache key with { count, rate }
   *
   * @param key cache key
   */
  hits?(key: string): Hits | Promise<Hits>;
}

export interface Cached {
  body: any;
  type: string;
  lastModified: string;
  etag: string;
};

const createDb = (max: number) => {
  const db = new LRU<string, Cached>(max);

  return {
    async get(key: string, maxAge: number) {
      return db.get(key, { maxAge });
    },
    async set(key: string, value: Cached, maxAge: number) {
      db.set(key, value, { maxAge });
    },
    async hits(key: string) {
      return db.hits() as Hits;
    },
  };
}

const creatCacheHits = (options?: Options) => {
  const _options = options || {} as Options;
  const getKey = isUndefined(_options.key)
    ? (ctx: Context) => ctx.originalUrl || ctx.url
    : isString(_options.key)
      ? (ctx: Context) => ctx[_options.key as any] as string
      : _options.key;

  const max = _options.max || 100;

  const maxAge = _options.maxAge || 3600000;
  let { get, set, hits } = _options;

  if (!get || !set || !hits) {
    const database = createDb(max);

    get = database.get;
    set = database.set;
    hits = database.hits;
  }

  return async function koexCache(ctx: Context, next: () => Promise<any>) {
    if (ctx.method !== 'GET') {
      return next();
    }

    const key = getKey(ctx);
    const cached = await get!(key, maxAge);

    if (cached) {
      const hitsCount = await hits!(key);
      ctx.set('X-Cache-Hits', `rate=${(hitsCount.rate * 100).toFixed(2)}%`);

      ctx.type = cached.type;
      setType(ctx, 'Content-Type', cached.type);
      setType(ctx, 'Last-Modified', cached.lastModified);
      setType(ctx, 'etag', cached.etag);

      if (ctx.request.fresh) {
        ctx.status = 304;
      }

      // ctx.status = 200;
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

    await set!(key, data, maxAge);
  };

  function setType(ctx: Context, type: string, value: string) {
    if (value) {
      ctx.set(type, value);
    }
  }
}

export {
  creatCacheHits,
};

export default creatCacheHits;
