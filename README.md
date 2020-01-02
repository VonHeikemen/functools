# Functools

This is a set utility functions that I have seen in other places. Here I collect the most useful in their ES5 compatible version. This is mostly for personal use.

## Functions
Most of this function support currying by default.

### T
- Always return `true`.

```javascript
 T() // => true
```

### F
- Always returns `false`.

```javascript
 F() // => false
```

### identity
- Returns the given argument.

```javascript
 identity('id') // => 'id'
```

### constant
- Returns a function that always returns the same value.

```javascript
 const greet = constant('Hello')
 greet() // => 'Hello'
```

### is_nil
- Returns `true` if the argument is null, undefined or NaN.

```javascript
  is_nil(undefined) // => true
  is_nil(null) // => true
  is_nil(NaN) // => true
```

### pick
- Returns a partial copy of an `obj` containing only the given keys.

```javascript
 // keys can be an array
 pick(['a', 'c'], {a: 1, b: 2}) // => {a: 1}

 // or a comma separated string
 pick('a,c', {a: 1, b: 2}) // => {a: 1}
```

### path
- Tries to get the value of the `path` in the object given.

```javascript
 path('a.b', {a: {b: 1}}) // => 1
```

### assoc
- It creates a shallow copy of the value in the provided `path` then sets or overrides the property with specified value.

```javascript
 assoc(['a', 'b', 'c'], 42, {a: {b: {c: 0}}}); // => {a: {b: {c: 42}}}
```

### flip
- It flips the order of the first two arguments of a function. It's only meant to be used with a function that takes two arguments.

```javascript
 const substract = (a, b) => a - b;
 const flipped = flip(substract);

 flipped(1, 7) // => 6

 // it also makes it a curried function
 const take_one = flipped(1)
 take_one(7) // => 6
```

### pipe
- Call a list of functions from left-to-right. The result of the previous function becomes the input of the next.

```javascript
 const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1)
 const excited = str => str + '!!'
 const add_world = str => str + ', world'

 const greet = pipe(capitalize, add_world, excited)
 greet('hello') // => Hello, world!!
```

### compose
- Call a list of functions from right-to-left. The result of the previous function becomes the input of the next.

```javascript
 const capitalize = word => word.charAt(0).toUpperCase() + word.slice(1)
 const excited = str => str + '!!'
 const add_world = str => str + ', world'

 const greet = compose(excited, add_world, capitalize)
 greet('hello') // => Hello, world!!
```

### xargs
- Call a list of functions from left-to-right. It gives the functions the same arguments. Returns the first argument given to the "result function."

```javascript
 let greet = 'Hello'
 const add = key => args => greet += args[key]
 const add_to_greet = xargs(add('comma'), add('subject'), add('exclamation'))

 add_to_greet({ comma: ', ', subject: 'world', exclamation: '!!' })

 // now
 greet // => Hello, world!!
```

### curry
- Allow partial application until function arity is satisfied.

```javascript
 const add_four = (a, b, c, d) => a + b + c + d;
 const stage_one = curry(add_four)

 const stage_two = stage_one(1, 2)
 const final_stage = stage_two(3)

 final_stage(4) // 10
```

### debounce
- Creates a function that waits a given amount of miliseconds to be called again.

```javascript
 let calls = 0
 const count = () => calls++
 const slow_count = debounce(10, count)

 slow_count()
 slow_count()
 slow_count()

 calls // => 1
```

### when
- Applies the argument to a `function` if the predicate function return something truthy.

```javascript
 let greeting = 'hello';
 const append = str => str + ', world!';
 const is_hello = str => str === 'hello';

 const better_greeting = when(is_hello, append, greeting);

 better_greeting // => hello, world!
```

### then
- Attach a callback to a promise `then`.

```javascript
 const append = str => str + ', world!';

 pipe(async_greet, then(append))
```

### pcatch
- Attach a callback to a promise `catch`.

```javascript
  const append = str => str + ', world!';
  const fallback = () => 'hi, you';

  pipe(async_greet, then(append), pcatch(fallback))
```

### tap
- Let a `function` take a look at a value and give it back.

```javascript
 const taplog = tap(console.log)

 async_greet().then(taplog).then(do_stuff)
```

### taplog
- Let `console.log` take a look at a value and give it back.

```javascript
 async_greet().then(taplog).then(do_stuff)
```

## Lens
- Wrap a getter and a setter function into a composable unit. It can be used to modify deeply nested object structures.  Once you have a lens you can `view`, replace (`set`) and transform (`over`) an object with the provided utility functions.

```javascript
const x_lens = Lens(path(['x']), assoc(['x']));
const negate = arg => arg * -1;

Lens.view(x_lens, {x: 1, y: 2});          // => 1
Lens.set(x_lens, 4, {x: 1, y: 2});        // => {x: 4, y: 2}
Lens.over(x_lens, negate, {x: 1, y: 2});  // => {x: -1, y: 2}
```

### Lens.prop
- It's lens wrapper around `path` and `assoc` functions. It is meant to create a lens over a single property.

```javascript
const x_lens = Lens.prop('x');
const negate = arg => arg * -1;

Lens.view(x_lens, {x: 1, y: 2});          // => 1
Lens.set(x_lens, 4, {x: 1, y: 2});        // => {x: 4, y: 2}
Lens.over(x_lens, negate, {x: 1, y: 2});  // => {x: -1, y: 2}
```

### Lens.path
- It's lens wrapper around `path` and `assoc` functions. It can create a lens over nested properties.

```javascript
const x_lens = Lens.path(['x']);
const negate = arg => arg * -1;

Lens.view(x_lens, {x: 1, y: 2});          // => 1
Lens.set(x_lens, 4, {x: 1, y: 2});        // => {x: 4, y: 2}
Lens.over(x_lens, negate, {x: 1, y: 2});  // => {x: -1, y: 2}
```

## Types

### Maybe
- Provides a safe way to deal with "empty values" like null and undefined.

```javascript
  const search = input => Maybe(data[input])
  const format = results => results.join(',')
  const fallback = () => 'not found'
  const Identity = x => x

  const result = search('some-term')
    .map(format)
    .cata(Identity, fallback)

  // now 'result' can't be undefined
  // it will either have the desired content
  // or it contain a message
```

### Result
- Represents an operation that can fail.

```javascript
  const search = input => data[input] === undefined 
    ? Result.Err({message: 'not found'})
    : Result(data[input])

  const format = results => results.join(',')
  const Identity = x => x

  const result = search('some-term')
    .map(format)
    .catchmap(error => error.message)
    .cata(Identity, Identity)
```

### Effect
- Represents a side effect. It wraps an `effect` runs it only when you call `run`.

```javascript
 const read = id => Effect(() => $(id).text())
 const write = id => value => Effect(() => $(id).text(value))

 const to_upper = text => text.toUpperCase()
 const change_text = read("#myId").map(to_upper).chain(write("#myId"))

 change_text.run()
```

### "Future"
- It's a wrapper around promises to make them somewhat compatible with the rest of the types.

```javascript
 const async_stuff = () => { /* mystery */ }
 const search = input => Maybe(data[input])
 const format = results => results.join(',')
 const fallback = () => 'not found'
 const Identity = x => x

 const result = await search('some-term')
   .chain(Future.of)                       // turn the maybe into a future
   .map(async_stuff)                       // begin your async stuff
   .map(format)                            // keep doing your thing
   .cata(Identity, fallback)
```

Check out [this codepen example](https://codepen.io/VonHeikemen/pen/QWWYJwZ) for a better look of how it would be used.

## Want to use it?

I guess you'll have to clone/download it and then do.

```
 npm install
 npm run test
 npm run build
```

You will have everything you need on the `dist` folder.

The minified version for browsers will store the functions under the variable `functools`.

