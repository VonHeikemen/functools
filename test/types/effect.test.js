import { strict as t } from 'assert';
import { Effect } from '../../src/types';

suite('# Effect Type');

test('runs effect function', function() {
  const value = 'hello';
  const get_val = () => value;
  const result = Effect(get_val);

  t.equal(result.run(), value);
});

test('Functor Identity', function() {
  // Val.map(val => val)
  // is equivalent to
  // val

  const expected = 'hello!!';

  const value = () => 'hello';
  const get_val = str => str + '!!';
  const result = Effect(value).map(get_val);

  t.equal(result.run(), expected);
});

test('Functor Composition', function() {
  // Val.map(val => fx(gx(val)))
  // is equivalent to
  // Val.map(gx).map(fx)

  const value = () => 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';

  const expected = 'hello, world!!';
  const composition = value => fx(gx(value));

  const one = Effect(value).map(composition);
  const two = Effect(value)
    .map(gx)
    .map(fx);

  t.equal(one.run(), expected);
  t.equal(two.run(), expected);
});

test('Apply Composition', function() {
  // Val.ap(Gx.ap(Fx.map(fx => gx => val => fx(gx(val)))))
  // is equivalent to
  // Val.ap(Gx).ap(Fx)

  const expected = 'hello, world!!';

  const value = () => 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';
  const composition = fx => gx => val => fx(gx(val));

  const Gx = Effect.of(gx);
  const Fx = Effect.of(fx);

  const one = Effect(value).ap(Gx.ap(Fx.map(composition)));
  const two = Effect(value)
    .ap(Gx)
    .ap(Fx);

  t.equal(one.run(), expected);
  t.equal(two.run(), expected);
});

test('Applicative Identity', function() {
  // Val.ap(M.of(val => val))
  // is equivalent to
  // val

  const value = () => 'hello';
  const Id = Effect.of(val => val);

  const result = Effect(value).ap(Id);
  t.equal(result.run(), value());
});

test('Applicative Homomorphism', function() {
  // M.of(val).ap(M.of(fn))
  // is equivalent to
  // M.of(fn(val))

  const expected = 'hello!!';
  const value = 'hello';
  const fn = str => str + '!!';

  const Fn = Effect.of(fn);

  const one = Effect.of(value).ap(Fn);
  const two = Effect.of(fn(value));

  t.equal(one.run(), expected);
  t.equal(two.run(), expected);
});

test('Applicative Interchange', function() {
  // M.of(y).ap(U)
  // is equivalent to
  // U.ap(M.of(f => f(y)))

  const expected = 'hello!!';
  const value = 'hello';
  const fn = str => str + '!!';
  const Fn = Effect.of(fn);

  const one = Effect.of(value).ap(Fn);
  const two = Fn.ap(Effect.of(fx => fx(value)));

  t.equal(one.run(), expected);
  t.equal(two.run(), expected);
});

test('Chain Associativity', function() {
  // Val.chain(Fx).chain(Gx)
  // is equivalent to
  // Val.chain(val => Fx(val).chain(Gx))

  const expected = 'hello, world!!';

  const value = () => 'hello';
  const fx = str => str + '!!';
  const gx = str => str + ', world';

  const Fx = str => Effect(() => fx(str));
  const Gx = str => Effect(() => gx(str));

  const one = Effect(value)
    .chain(Gx)
    .chain(Fx);
  const two = Effect(value).chain(val => Gx(val).chain(Fx));

  t.equal(one.run(), expected);
  t.equal(two.run(), expected);
});

test('Monad Left Identity', function() {
  // M.of(a).chain(f)
  // is equivalent to
  // f(a)

  const expected = 'hello!!';

  const value = 'hello';
  const fx = str => str + '!!';

  const one = Effect.of(value).chain(fx);
  const two = fx(value);

  t.equal(one, expected);
  t.equal(two, expected);
});

test('Monad Right Identity', function() {
  // Val.chain(M.of)
  // is equivalent to
  // Val

  const value = () => 'hello';
  const Val = Effect(value);

  const result = Val.chain(Effect.of);

  t.equal(result.run(), Val.run());
});
