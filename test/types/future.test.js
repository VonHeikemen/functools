import { strict as t } from 'assert';
import { Future } from '../../src/types';

const Identity = x => x;
const Constant = () => 'NOOOOO!!!!!';
const get = M => M.cata(Identity, Constant);

suite('# Future Type');

test('can "extract" values from a Future', async function() {
  const value = 'hello';
  const fallback = 'hi';
  const get = val => val;
  const catchit = () => fallback;

  const result = Future(value);

  t.equal(await result.cata(get, catchit), value);
});

test('Functor Identity', async function() {
  // Val.map(val => val)
  // is equivalent to
  // val

  const value = 'hello';
  const get_val = val => val;
  const result = Future(value).map(get_val);

  t.equal(await get(result), value);
});

test('Functor Composition', async function() {
  // Val.map(val => fx(gx(val)))
  // is equivalent to
  // Val.map(gx).map(fx)

  const value = 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';

  const expected = 'hello, world!!';
  const composition = value => fx(gx(value));

  const one = Future(value).map(composition);
  const two = Future(value)
    .map(gx)
    .map(fx);

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});

test('Apply Composition', async function() {
  // Val.ap(Gx.ap(Fx.map(fx => gx => val => fx(gx(val)))))
  // is equivalent to
  // Val.ap(Gx).ap(Fx)

  const expected = 'hello, world!!';

  const value = 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';
  const composition = fx => gx => val => fx(gx(val));

  const Gx = Future(gx);
  const Fx = Future(fx);

  const one = Future(value).ap(Gx.ap(Fx.map(composition)));
  const two = Future(value)
    .ap(Gx)
    .ap(Fx);

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});

test('Applicative Identity', async function() {
  // Val.ap(M.of(val => val))
  // is equivalent to
  // val

  const value = 'hello';
  const Id = Future.of(val => val);

  const result = Future(value).ap(Id);
  t.equal(await get(result), value);
});

test('Applicative Homomorphism', async function() {
  // M.of(val).ap(M.of(fn))
  // is equivalent to
  // M.of(fn(val))

  const expected = 'hello!!';
  const value = 'hello';
  const fn = str => str + '!!';

  const Fn = Future.of(fn);

  const one = Future.of(value).ap(Fn);
  const two = Future.of(fn(value));

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});

test('Applicative Interchange', async function() {
  // M.of(y).ap(U)
  // is equivalent to
  // U.ap(M.of(f => f(y)))

  const expected = 'hello!!';
  const value = 'hello';
  const fn = str => str + '!!';
  const Fn = Future(fn);

  const one = Future.of(value).ap(Fn);
  const two = Fn.ap(Future.of(fx => fx(value)));

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});
