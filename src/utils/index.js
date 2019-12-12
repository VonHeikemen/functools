function T() {
  return true;
}

function F() {
  return false;
}

function identity(arg) {
  return arg;
}

function constant(arg) {
  return function _constant() {
    return arg;
  };
}

function is_nil(arg) {
  return arg === undefined || arg === null || arg !== arg;
}

function pick(keys, obj) {
  if (arguments.length === 1) {
    return pick.bind(this, keys);
  }

  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (typeof keys == 'string') {
    keys = keys.split(',');
  }

  var result = {};
  var idx = 0;

  while (idx < keys.length) {
    if (keys[idx] in obj) {
      result[keys[idx]] = obj[keys[idx]];
    }

    idx++;
  }

  return result;
}

function path(keys, obj) {
  if (arguments.length === 1) {
    return path.bind(this, keys);
  }

  if (typeof keys == 'string') {
    keys = keys.split('.');
  }

  var result = obj;
  var idx = 0;
  while (idx < keys.length) {
    if ((result == null) | (result == undefined)) {
      return;
    }
    result = result[keys[idx]];
    idx += 1;
  }

  return result;
}

function assoc(path, value, obj) {
  if (arguments.length === 1) {
    return assoc.bind(this, path);
  } else if (arguments.length === 2) {
    return assoc.bind(this, path, value);
  }

  if (path.length === 0) {
    return value;
  }

  var index = path[0];

  if (path.length > 1) {
    var create_new =
      typeof obj !== 'object' || obj === null || !obj.hasOwnProperty(index);

    var next = create_new
      ? typeof path[1] === 'number'
        ? []
        : {}
      : obj[index];

    value = assoc(Array.prototype.slice.call(path, 1), value, next);
  }

  if (typeof index === 'number' && Array.isArray(obj)) {
    var arr = [].concat(obj);
    arr[index] = value;
    return arr;
  } else {
    var result = {};
    for (var p in obj) {
      result[p] = obj[p];
    }
    result[index] = value;
    return result;
  }
}

function flip(fn) {
  return function flipped(a, b) {
    if (arguments.length === 1) {
      return flipped.bind(this, a);
    }

    return fn(b, a);
  };
}

function pipe() {
  var fns = arguments;

  return function _pipe() {
    var acc = fns[0].apply(this, arguments);

    for (var i = 1; i < fns.length; i++) {
      acc = fns[i](acc);
    }

    return acc;
  };
}

function compose() {
  var fns = arguments;

  return function _composed() {
    var last = fns.length - 1;
    var acc = fns[last--].apply(this, arguments);

    for (var i = last; i >= 0; i--) {
      acc = fns[i](acc);
    }

    return acc;
  };
}

function xargs() {
  var fns = arguments;

  return function _xargs() {
    for (var i = 0; i < fns.length; i++) {
      fns[i].apply(this, arguments);
    }

    return arguments[0];
  };
}

function curry(fn, arity) {
  if (arguments.length === 1) {
    arity = fn.length;
  }

  var rest = Array.prototype.slice.call(arguments, 2);

  if (arity <= rest.length) {
    return fn.apply(fn, rest);
  }

  var args = [null, fn, arity].concat(rest);

  return curry.bind.apply(curry, args);
}

function debounce(delay, fn) {
  if (arguments.length === 1) {
    return debounce.bind(this, delay);
  }

  var timeout_id;
  return function _debounced() {
    clearTimeout(timeout_id);
    timeout_id = setTimeout(function _apply() {
      return fn.apply(null, arguments);
    }, delay);
  };
}

function when(predicate, fn, arg) {
  if (arguments.length === 1) {
    return when.bind(this, predicate);
  } else if (arguments.length === 2) {
    return when.bind(this, predicate, fn);
  }

  if (predicate(arg)) {
    return fn(arg);
  }

  return arg;
}

function then(fn, promise) {
  if (arguments.length === 1) {
    return then.bind(this, fn);
  }

  return promise.then(fn);
}

function pcatch(fn, promise) {
  if (arguments.length === 1) {
    return pcatch.bind(this, fn);
  }

  return promise.catch(fn);
}

function tap(fn, arg) {
  if (arguments.length === 1) {
    return tap.bind(this, fn);
  }

  return fn(arg), arg;
}

function taplog(arg) {
  return console.log(arg), arg;
}

export {
  T,
  F,
  identity,
  constant,
  is_nil,
  flip,
  pick,
  path,
  assoc,
  pipe,
  compose,
  curry,
  xargs,
  debounce,
  when,
  then,
  pcatch,
  tap,
  taplog
};
