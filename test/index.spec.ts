import * as Koa from 'koa';
import * as request from 'supertest';

import LRU from '@zcorky/lru';
import Cache, { Options } from '../src';

const createApp = (options?: Options) => {
  const _app = new Koa();
  _app.use(Cache(options));
  _app.use(async (ctx: Koa.Context) => {
    if (ctx.path === '/') {
      // if (ctx.query.disableCache) {
      //   ctx.disableCache = true;
      // }
      // console.log('query: ', ctx.query);

      ctx.body = 'hello, world';
    } else if (ctx.path === '/json') {
      ctx.body = {
        name: 'name',
        value: 'value',
      };
    } else if (ctx.path === '/cache-utils') {
      let user = await ctx.cache.get('z001');

      if (!user) {
        user = { name: 'name', value: 'value' }

        ctx.cache.set(user.id, user);
      }

      ctx.body = user;
    }
  });

  return _app;
};

describe('Cache Hits', () => {
  describe('with internal lru cache', () => {
    const app = createApp({
      key: ctx => ctx.url,
      max: 10,
    });

    it('no cache, hit nothing (0/1)', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('hello, world', (err, res) => {
          if (err) return done(err);

          expect(res.headers['X-Cache-Hits']).toEqual(undefined);
          done();
        });
    });

    it('hit cache (1/2)', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('hello, world', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=50.00%');
          done();
        });
    });

    it('first vist json, miss hit (1/3)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['X-Cache-Hits']).toEqual(undefined);
          done();
        });
    });

    it('hit cache (2/4)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=50.00%');
          done();
        });
    });

    it('hit cache (3/5)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=60.00%');
          done();
        });
    });

    it('hit cache (4/6)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=66.67%');
          done();
        });
    });

    it('only cache GET (post)', (done) => {
      request(app.callback())
        .post('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual(undefined);
          done();
        });
    });

    it('only cache GET (patch)', (done) => {
      request(app.callback())
        .patch('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual(undefined);
          done();
        });
    });

    it('only cache GET (delete)', (done) => {
      request(app.callback())
        .delete('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual(undefined);
          done();
        });
    });

    it('use cache utils', (done) => {
      request(app.callback())
        .delete('/cache-utils')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          done();
        });
    });

    it('disable cache manually', (done) => {
      request(app.callback())
      .get('/?disableCache=true')
      .expect(200)
        .expect('hello, world', (err, res) => {
          if (err) return done(err);

          expect(res.headers['X-Cache-Hits']).toEqual(undefined);
          done();
        });
    });
  });

  describe('with custom cache', () => {
    const cache = new LRU<string, any>(100);
    const app = createApp({
      key: ctx => ctx.url,
      max: 10,
      get: cache.get.bind(cache),
      set: cache.set.bind(cache),
      hits: cache.hits.bind(cache),
    });

    it('no cache, hit nothing (0/1)', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('hello, world', (err, res) => {
          if (err) return done(err);

          expect(res.headers['X-Cache-Hits']).toEqual(undefined);
          done();
        });
    });

    it('hit cache (1/2)', (done) => {
      request(app.callback())
        .get('/')
        .expect(200)
        .expect('hello, world', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=50.00%');
          done();
        });
    });

    it('first vist json, miss hit (1/3)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['X-Cache-Hits']).toEqual(undefined);
          done();
        });
    });

    it('hit cache (2/4)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=50.00%');
          done();
        });
    });

    it('hit cache (3/5)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=60.00%');
          done();
        });
    });

    it('hit cache (4/6)', (done) => {
      request(app.callback())
        .get('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual('rate=66.67%');
          done();
        });
    });

    it('only cache GET (post)', (done) => {
      request(app.callback())
        .post('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual(undefined);
          done();
        });
    });

    it('only cache GET (patch)', (done) => {
      request(app.callback())
        .patch('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual(undefined);
          done();
        });
    });

    it('only cache GET (delete)', (done) => {
      request(app.callback())
        .delete('/json')
        .expect(200)
        .expect('{"name":"name","value":"value"}', (err, res) => {
          if (err) return done(err);

          expect(res.headers['x-cache-hits']).toEqual(undefined);
          done();
        });
    });
  });
});
