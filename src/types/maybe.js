function Nothing() {
  return {
    map: Nothing,
    chain: Nothing,
    ap: Nothing,
    cata: function(just_path, nothing_path) {
      return nothing_path();
    },

    is_just: false,
    is_nothing: true
  };
}

function Just(value) {
  return {
    map: function(fn) {
      return Maybe(fn(value));
    },
    chain: function(fn) {
      return fn(value);
    },
    ap: function(functor) {
      return functor.map(function(fn) {
        return fn(value);
      });
    },
    cata: function(just_path, nothing_path) {
      return just_path(value);
    },

    is_just: true,
    is_nothing: false
  };
}

function Maybe(value) {
  if (value === undefined || value === null || value.is_nothing) {
    return Nothing();
  }

  return Just(value);
}

Maybe.of = Maybe;
Maybe.Just = Just;
Maybe.Nothing = Nothing;

export { Maybe, Just, Nothing };
