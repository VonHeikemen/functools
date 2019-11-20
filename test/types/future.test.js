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

  const result = Future.of(value);

  t.equal(await result.cata(get, catchit), value);
});

test('Filterable Distributivity', async function() {
  // Val.filter(x => p(x) && q(x))
  // is equivalent to
  // Val.filter(p).filter(q)

  const expected = 'hello';
  const is_string = str => typeof str === 'string';
  const is_hello = str => str === 'hello';

  const one = Future.of(expected).filter(
    val => is_string(val) && is_hello(val)
  );
  const two = Future.of(expected)
    .filter(is_string)
    .filter(is_hello);

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});

test('Filterable Identity', async function() {
  // Val.filter(x => true)
  // is equivalent to
  // val

  const result = Future.of('hello').filter(val => true);

  t.equal(await get(result), 'hello');
});

test('Filterable Annihilation', async function() {
  // A.filter(x => false)
  // is equivalent to
  // B.filter(x => false)

  const expected = Constant();
  const one = Future.of('hello').filter(val => false);
  const two = Future.of('hi').filter(val => false);

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});

test('Functor Identity', async function() {
  // Val.map(val => val)
  // is equivalent to
  // val

  const value = 'hello';
  const get_val = val => val;
  const result = Future.of(value).map(get_val);

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

  const one = Future.of(value).map(composition);
  const two = Future.of(value)
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

  const Gx = Future.of(gx);
  const Fx = Future.of(fx);

  const one = Future.of(value).ap(Gx.ap(Fx.map(composition)));
  const two = Future.of(value)
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

  const result = Future.of(value).ap(Id);
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
  const Fn = Future.of(fn);

  const one = Future.of(value).ap(Fn);
  const two = Fn.ap(Future.of(fx => fx(value)));

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});

test('Alt Associativity', async function() {
  // Val.alt(b).alt(c)
  // is equivalent to
  // Val.alt(b.alt(c))

  const expected = 'hello';
  const Value = 'hello';
  const A = Future.of('').filter(() => false);
  const B = Future.of('').filter(() => false);

  const one = A.alt(B).alt(Value);
  const two = A.alt(B.alt(Value));

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});

test('Alt Distributivity', async function() {
  // Val.alt(b).map(f)
  // is equivalent to
  // Val.map(f).alt(b.map(f))

  const expected = 'hello!!';
  const fx = str => str + '!!';

  const A = Future.of('').filter(() => false);
  const Value = Future.of('hello');

  const one = A.alt(Value).map(fx);
  const two = A.map(fx).alt(Value.map(fx));

  t.equal(await get(one), expected);
  t.equal(await get(two), expected);
});
