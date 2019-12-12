function Effect(effect) {
  return {
    map: function(fn) {
      return Effect(function _map() {
        return fn(effect());
      });
    },
    chain: function(fn) {
      return Effect(function _chain() {
        var res = fn(effect());

        return res != null && res.is_effect ? res.run() : res;
      });
    },
    ap: function(functor) {
      return functor.map(function _ap(fn) {
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
  return Effect(function _of() {
    return value;
  });
};

export { Effect };
