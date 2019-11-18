import { strict as t } from 'assert';
import {
  compose,
  curry,
  debounce,
  flip,
  is_nil,
  path,
  pick,
  pipe,
  then,
  when,
  pcatch,
  tap,
  xargs
} from '../../src/utils';

suite('# is_nil');

test('return true with NaN', function() {
  t.ok(is_nil(NaN));
});

suite('# path');

test('get value from array', function() {
  const obj = { a: { b: [1, { c: 3 }] } };

  t.equal(path('a.b.1.c', obj), 3);
  t.equal(path('a.b.1.c')(obj), 3);
});

test('does not throw with undefined', function() {
  const obj = { a: { b: { c: 1 } } };

  t.equal(path('a.b.c.d.f', obj), undefined);
  t.equal(path('foo.b', obj), undefined);
});

suite('# pick');

test('choose props from object', function() {
  const obj = { a: 1, b: 2, c: 3 };
  const expected = { a: 1, c: 3 };

  t.deepEqual(pick('a,c', obj), expected, '');
  t.deepEqual(pick('a,c')(obj), expected, '');
});

suite('# flip');

test('reverse first two arguments', function() {
  const substract = (a, b) => a - b;
  const flipped = flip(substract);

  t.equal(flipped(1, 7), 6);
  t.equal(flipped(1)(7), 6);
});

suite('# pipe');

test('compose functions left-to-right', function() {
  const add = num => arr => arr.map(val => val + num);
  const last = arr => arr[arr.length - 1];

  const fn = pipe(add(1), add(10), last);
  t.equal(fn([1, 2, 3]), 14);
});

suite('# compose');

test('compose functions right-to-left', function() {
  const add = num => arr => arr.map(val => val + num);
  const last = arr => arr[arr.length - 1];

  const fn = compose(last, add(10), add(1));
  t.equal(fn([1, 2, 3]), 14);
});

suite('# xargs');

test('compose functions left-to-right', function() {
  const expected = 'Hello, world!!';
  let value = 'Hello';

  const add = key => args => (value += args[key]);
  const fn = xargs(add('comma'), add('subject'), add('exclamation'));

  const arg = { comma: ', ', subject: 'world', exclamation: '!!' };
  fn(arg);

  t.equal(value, expected);
});

test('returns first argument back', function() {
  const expected = 'hi';
  const noop = () => {};

  const fn = xargs(noop);

  t.equal(fn('hi', 'bye'), expected);
});

suite('# curry');

test('allow partial application until function arity is satisfied', function() {
  const add_four = (a, b, c, d) => a + b + c + d;
  const stage_one = curry(add_four);

  const stage_two = stage_one(1, 2);
  const final_stage = stage_two(3);

  t.equal(final_stage(4), 10);
});

test('call with more arguments then needed', function() {
  const add = (a, b) => a + b;
  const curried = curry(add);

  t.equal(curried(1, 2, 5), 3);
});

suite('# debounce');

test('function is called only once', function() {
  let calls = 0;
  const count = () => calls++;
  const debounced = debounce(1, count);
  const assert = () => t.equal(calls, 1);

  debounced();
  debounced();
  debounced();

  const wait = fn =>
    new Promise(res => {
      setTimeout(() => res(fn()), 2);
    });

  return wait(assert);
});

suite('# when');

test('call function when predicate returns true', function() {
  let greeting = 'hello';
  const append = str => str + ', world!';
  const is_hello = str => str === 'hello';

  const result = when(is_hello, append, greeting);
  t.equal(result, 'hello, world!');

  const result_curried = when(is_hello)(append)(greeting);
  t.equal(result_curried, 'hello, world!');
});

test('return third argument if predicate returns false', function() {
  let greeting = 'Hi';
  const append = str => str + ', world!';
  const is_hello = str => str === 'hello';

  let result = when(is_hello, append, greeting);
  t.equal(result, greeting);
});

suite('# then');

test('attach function to a promise', function() {
  const greeting = Promise.resolve('hello');
  const append = str => str + ', world!';
  const assert = result => t.equal(result, 'hello, world!');

  return then(append, greeting).then(assert);
});

suite('# pcatch');

test('recover from a rejected promise', function() {
  const reason = 'some reason';
  const an_error = () => new Promise((res, reject) => reject(reason));
  const assert = result => t.equal(result, reason);

  return pcatch(assert, an_error());
});

suite('# tap');

test('returns same argument', function() {
  let greeting = 'hello';
  const append = str => str + ', world!';
  const assert = str => t.equal(str, greeting);

  const tap_one = tap(append);
  const tap_two = tap(assert);

  t.equal(tap_two(tap_one(greeting)), greeting);
});
