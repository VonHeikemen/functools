import { path, assoc, constant } from './index.js';

function Const(val) {
  return {
    value: val,
    map: function() {
      return this;
    }
  };
}

function Identity(val) {
  return {
    value: val,
    map: function(fn) {
      return Identity(fn(val));
    }
  };
}

function fmap(fn, target) {
  if (typeof target.map === 'function') {
    return target.map(fn);
  }

  return target;
}

function Lens(getter, setter) {
  if (arguments.length === 1) {
    return Lens.bind(this, getter);
  }

  return function(to_functor) {
    return function(target) {
      var apply_setter = function(focus) {
        return setter(focus, target);
      };

      return fmap(apply_setter, to_functor(getter(target)));
    };
  };
}

Lens.view = function(lens, x) {
  if (arguments.length === 1) {
    return Lens.view.bind(this, lens);
  }

  return lens(Const)(x).value;
};

Lens.over = function(lens, f, x) {
  if (arguments.length === 1) {
    return Lens.over.bind(this, lens);
  } else if (arguments.length === 2) {
    return Lens.over.bind(this, lens, f);
  }

  var apply_identity = function(y) {
    return Identity(f(y));
  };

  return lens(apply_identity)(x).value;
};

Lens.set = function(lens, v, x) {
  if (arguments.length === 1) {
    return Lens.set.bind(this, lens);
  } else if (arguments.length === 2) {
    return Lens.set.bind(this, lens, v);
  }

  return Lens.over(lens, constant(v), x);
};

Lens.prop = function(key) {
  return Lens(path([key]))(assoc([key]));
};

Lens.path = function(keys) {
  return Lens(path(keys))(assoc(keys));
};

export { Lens };
