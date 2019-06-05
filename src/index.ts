import { Context } from 'koa';
import LRU, { Hits } from '@zcorky/lru';
import { undefined as isUndefined, string as isString } from '@zcorky/is';

declare module 'koa' {
  interface CacheUtils {
    /**
     * Get a value from store by key.
     *
     * @param key cache key
     * @param maxAge cache max age
     * @returns Promise<Cached>
     */
    get<T = any>(key: string, maxAge?: number): Promise<T | undefined>;

    /**
     * Set a value to store.
     *
     * @param key cache key
     * @param value cache value
     * @param maxAge cache max age
     */
    set<T = any>(key: string, value: T, maxAge?: number): Promise<void>
  }
  export interface Context {
    /**
     * disable koex cache
     */
    disableCache?: boolean;

    /**
     * cache utils.
     */
    cache: CacheUtils;
  }
}

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

const createCache = (options?: Options) => {
  const _options = options || {} as Options;
  const getKey = isUndefined(_options.key)
    ? (ctx: Context) => (ctx.originalUrl || ctx.url) as string
    : isString(_options.key)
      ? (ctx: Context) => ctx[_options.key as any] as string
      : _options.key as (ctx: any) => string;

  const max = _options.max || 100;

  const maxAge = _options.maxAge || 3600000;
  let { get, set, hits } = _options;

  if (!get || !set) {
    const database = createDb(max);

    get = database.get;
    set = database.set;
    hits = database.hits;
  }

  const cacheUtils = { get, set };

  return async function koexCache(ctx: Context, next: () => Promise<any>) {
    // override ctx.cache
    ctx.cache = cacheUtils as any;

    if (ctx.method !== 'GET' && ctx.method !== 'HEAD') {
      return next();
    }

    if (ctx.request.fresh) {
      ctx.status = 304;
      return ;
    }

    const key = getKey(ctx);
    const cached = await get!(key, maxAge);

    if (cached) {
      if (hits) {
        const hitsCount = await hits!(key);
        ctx.set('X-Cache-Hits', `rate=${(hitsCount.rate * 100).toFixed(2)}%`);
      }

      ctx.status = 200;
      ctx.body = cached.body;
      return;
    }

    await next();

    // support controller disable cache custom
    if (ctx.disableCache) {
      return ;
    }

    // only cache GET/HEAD 200 and have body
    if (ctx.method !== 'GET' && ctx.method !== 'HEAD') return ;
    if (ctx.status !== 200) return ;
    if (!ctx.body) return ;

    const body = ctx.body

    const data = {
      body,
    };

    await set!(key, data, maxAge);
  };
}

export {
  createCache,
};

export default createCache;
