import { strict as t } from 'assert';
import { Result } from '../../src/types';

const Identity = x => x;
const Constant = () => 'NOOOOO!!!!!';
const get = M => M.cata(Identity, Constant);
const get_err = M => M.cata(Constant, Identity);

suite('# Result Type');

test('falsey values are Ok by default', function() {
  t.ok(Result().is_ok);
  t.ok(Result(undefined).is_ok);
  t.ok(Result(null).is_ok);
});

test('can extract values from Result', function() {
  const value = 'hello';
  const fallback = 'hi';
  const get = val => val;
  const catchit = str => fallback + '!!';

  const ok = Result(value);
  const err = Result.Err(fallback);

  t.equal(ok.cata(get, catchit), value);
  t.equal(err.cata(get, catchit), catchit(fallback));
});

test('swap from Ok to Err and back', function() {
  const value = 'hello';

  const err = Result.Err(value);
  const to_ok = err.swap();

  const ok = Result(value);
  const to_err = ok.swap();

  t.equal(get(to_ok), value);
  t.equal(get_err(to_err), value);
});

test('can transform Err values', function() {
  const expected = 'hi';
  const greeting = 'hello';
  const fx = str => str + '!!';

  const result = Result.Err(expected)
    .map(() => greeting)
    .catchmap(fx);

  t.equal(get_err(result), fx(expected));
});

test('can map both branches', function() {
  const value = 'hello';
  const Value = Result(value);

  const ok = str => str + '!!';
  const err = str => str + '??';

  const ok_val = Value.bimap(ok, err);
  const err_val = Value.swap().bimap(ok, err);

  t.equal(get(ok_val), ok(value));
  t.equal(get_err(err_val), err(value));
});

test('Functor Identity', function() {
  // Val.map(val => val)
  // is equivalent to
  // val

  const value = 'hello';
  const get_val = val => val;
  const result = Result(value).map(get_val);

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

  const one = Result(value).map(composition);
  const two = Result(value)
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

  const Gx = Result(gx);
  const Fx = Result(fx);

  const one = Result(value).ap(Gx.ap(Fx.map(composition)));
  const two = Result(value)
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
  const Id = Result.of(val => val);

  const result = Result(value).ap(Id);
  t.equal(get(result), value);
});

test('Applicative Homomorphism', function() {
  // M.of(val).ap(M.of(fn))
  // is equivalent to
  // M.of(fn(val))

  const expected = 'hello!!';
  const value = 'hello';
  const fn = str => str + '!!';

  const Fn = Result.of(fn);

  const one = Result.of(value).ap(Fn);
  const two = Result.of(fn(value));

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
  const Fn = Result(fn);

  const one = Result.of(value).ap(Fn);
  const two = Fn.ap(Result.of(fx => fx(value)));

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

  const Fx = str => Result(fx(str));
  const Gx = str => Result(gx(str));

  const one = Result(value)
    .chain(Gx)
    .chain(Fx);
  const two = Result(value).chain(val => Gx(val).chain(Fx));

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

  const one = Result.of(value).chain(fx);
  const two = fx(value);

  t.equal(one, expected);
  t.equal(two, expected);
});

test('Monad Right Identity', function() {
  // Val.chain(M.of)
  // is equivalent to
  // Val

  const value = 'hello';
  const Val = Result(value);

  const result = Val.chain(Result.of);

  t.equal(get(result), get(Val));
});
