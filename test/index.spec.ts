import * as Koa from 'koa';
import * as request from 'supertest';
import { expect } from 'chai';

import LRU from '@zcorky/lru';
import Cache, { Options } from '../src';

const createApp = (options?: Options<string, any>) => {
  const _app = new Koa();
  _app.use(Cache(options));
  _app.use(async (ctx) => {
    if (ctx.path === '/') {
      ctx.body = 'hello, world';
    } else if (ctx.path === '/json') {
      ctx.body = {
        name: 'name',
        value: 'value',
      };
    }
  });

  return _app;
};

const cache = new LRU<string, any>(100);
const app = createApp({
  key: ctx => ctx.url,
  max: 10,
  db: {
    get: cache.get.bind(cache),
    set: cache.set.bind(cache),
    hits: cache.hits.bind(cache),
    hasKey: cache.hasKey.bind(cache),
  },
});

describe('Cache Hits', () => {
  it('no cache, hit nothing (0/1)', (done) => {
    request(app.listen())
      .get('/')
      .expect(200)
      .expect('hello, world', (err, res) => {
        if (err) return done(err);

        expect(res.headers['X-Cache-Hits']).to.equal(undefined);
        done();
      });
  });

  it('hit cache (1/2)', (done) => {
    request(app.listen())
      .get('/')
      .expect(200)
      .expect('hello, world', (err, res) => {
        if (err) return done(err);

        expect(res.headers['x-cache-hits']).to.equal('rate=50.00%');
        done();
      });
  });

  it('first vist json, miss hit (1/3)', (done) => {
    request(app.listen())
      .get('/json')
      .expect(200)
      .expect('{"name":"name","value":"value"}', (err, res) => {
        if (err) return done(err);

        expect(res.headers['X-Cache-Hits']).to.equal(undefined);
        done();
      });
  });

  it('hit cache (2/4)', (done) => {
    request(app.listen())
      .get('/json')
      .expect(200)
      .expect('{"name":"name","value":"value"}', (err, res) => {
        if (err) return done(err);

        expect(res.headers['x-cache-hits']).to.equal('rate=50.00%');
        done();
      });
  });

  it('hit cache (3/5)', (done) => {
    request(app.listen())
      .get('/json')
      .expect(200)
      .expect('{"name":"name","value":"value"}', (err, res) => {
        if (err) return done(err);

        expect(res.headers['x-cache-hits']).to.equal('rate=60.00%');
        done();
      });
  });

  it('hit cache (4/6)', (done) => {
    request(app.listen())
      .get('/json')
      .expect(200)
      .expect('{"name":"name","value":"value"}', (err, res) => {
        if (err) return done(err);

        expect(res.headers['x-cache-hits']).to.equal('rate=66.67%');
        done();
      });
  });

  it('only cache GET (post)', (done) => {
    request(app.listen())
      .post('/json')
      .expect(200)
      .expect('{"name":"name","value":"value"}', (err, res) => {
        if (err) return done(err);

        expect(res.headers['x-cache-hits']).to.equal(undefined);
        done();
      });
  });

  it('only cache GET (patch)', (done) => {
    request(app.listen())
      .patch('/json')
      .expect(200)
      .expect('{"name":"name","value":"value"}', (err, res) => {
        if (err) return done(err);

        expect(res.headers['x-cache-hits']).to.equal(undefined);
        done();
      });
  });

  it('only cache GET (delete)', (done) => {
    request(app.listen())
      .delete('/json')
      .expect(200)
      .expect('{"name":"name","value":"value"}', (err, res) => {
        if (err) return done(err);

        expect(res.headers['x-cache-hits']).to.equal(undefined);
        done();
      });
  });
});
