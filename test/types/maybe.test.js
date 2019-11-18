import { strict as t } from 'assert';
import { Maybe } from '../../src/types';

const Identity = x => x;
const Constant = () => 'NOOOOO!!!!!';
const get = M => M.cata(Identity, Constant);

suite('# Maybe Type');

test('undefined, null and Nothing return Nothing', function() {
  t.ok(Maybe().is_nothing);
  t.ok(Maybe(undefined).is_nothing);
  t.ok(Maybe(null).is_nothing);
  t.ok(Maybe(Maybe.Nothing()).is_nothing);
});

test('other values are wrapped in a Just', function() {
  t.ok(Maybe(1).is_just);
  t.ok(Maybe('').is_just);
  t.ok(Maybe([]).is_just);
  t.ok(Maybe(function() {}).is_just);
});

test('can extract values from Maybe', function() {
  const value = 'hello';
  const fallback = 'hi';
  const get = val => val;
  const catchit = () => fallback;

  const just = Maybe(value);
  const nothing = Maybe(null);

  t.equal(just.cata(get, catchit), value);
  t.equal(nothing.cata(get, catchit), fallback);
});

test('Functor Identity', function() {
  // Val.map(val => val)
  // is equivalent to
  // val

  const value = 'hello';
  const get_val = val => val;
  const result = Maybe(value).map(get_val);

  t.equal(get(result), value);
});

test('Functor Composition', function() {
  // Val.map(val => fx(gx(val)))
  // is equivalent to
  // Val.map(gx).map(fx)

  const value = 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';

  const expected = 'hello, world!!';
  const composition = value => fx(gx(value));

  const one = Maybe(value).map(composition);
  const two = Maybe(value)
    .map(gx)
    .map(fx);

  t.equal(get(one), expected);
  t.equal(get(two), expected);
});

test('Apply Composition', function() {
  // Val.ap(Gx.ap(Fx.map(fx => gx => val => fx(gx(val)))))
  // is equivalent to
  // Val.ap(Gx).ap(Fx)

  const expected = 'hello, world!!';

  const value = 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';
  const composition = fx => gx => val => fx(gx(val));

  const Gx = Maybe(gx);
  const Fx = Maybe(fx);

  const one = Maybe(value).ap(Gx.ap(Fx.map(composition)));
  const two = Maybe(value)
    .ap(Gx)
    .ap(Fx);

  t.equal(get(one), expected);
  t.equal(get(two), expected);
});

test('Applicative Identity', function() {
  // Val.ap(M.of(val => val))
  // is equivalent to
  // val

  const value = 'hello';
  const Id = Maybe.of(val => val);

  const result = Maybe(value).ap(Id);
  t.equal(get(result), value);
});

test('Applicative Homomorphism', function() {
  // M.of(val).ap(M.of(fn))
  // is equivalent to
  // M.of(fn(val))

  const expected = 'hello!!';
  const value = 'hello';
  const fn = str => str + '!!';

  const Fn = Maybe.of(fn);

  const one = Maybe.of(value).ap(Fn);
  const two = Maybe.of(fn(value));

  t.equal(get(one), expected);
  t.equal(get(two), expected);
});

test('Applicative Interchange', function() {
  // M.of(y).ap(U)
  // is equivalent to
  // U.ap(M.of(f => f(y)))

  const expected = 'hello!!';
  const value = 'hello';
  const fn = str => str + '!!';
  const Fn = Maybe(fn);

  const one = Maybe.of(value).ap(Fn);
  const two = Fn.ap(Maybe.of(fx => fx(value)));

  t.equal(get(one), expected);
  t.equal(get(two), expected);
});

test('Chain Associativity', function() {
  // Val.chain(Fx).chain(Gx)
  // is equivalent to
  // Val.chain(val => Fx(val).chain(Gx))

  const expected = 'hello, world!!';

  const value = 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';

  const Fx = str => Maybe(fx(str));
  const Gx = str => Maybe(gx(str));

  const one = Maybe(value)
    .chain(Gx)
    .chain(Fx);
  const two = Maybe(value).chain(val => Gx(val).chain(Fx));

  t.equal(get(one), expected);
  t.equal(get(two), expected);
});

test('Monad Left Identity', function() {
  // M.of(a).chain(f)
  // is equivalent to
  // f(a)

  const expected = 'hello!!';

  const value = 'hello';
  const fx = str => str + '!!';

  const one = Maybe.of(value).chain(fx);
  const two = fx(value);

  t.equal(one, expected);
  t.equal(two, expected);
});

test('Monad Right Identity', function() {
  // Val.chain(M.of)
  // is equivalent to
  // Val

  const value = 'hello';
  const Val = Maybe(value);

  const result = Val.chain(Maybe.of);

  t.equal(get(result), get(Val));
});
