function Effect(effect) {
  return {
    map: function(fn) {
      return Effect(function() {
        return fn(effect());
      });
    },
    chain: function(fn) {
      return Effect(effect)
        .map(fn)
        .run();
    },
    ap: function(functor) {
      return functor.map(function(fn) {
        return fn(effect());
      });
    },

    run: function(arg) {
      return effect(arg);
    },

    is_effect: true
  };
}

Effect.of = function(value) {
  return Effect(function() {
    return value;
  });
};

export { Effect };
