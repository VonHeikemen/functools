function Future(val) {
  if (typeof val.then !== 'function') {
    var promise = Promise.resolve(val);
  } else {
    var promise = val;
  }

  return {
    map: function(fn) {
      return Future(promise.then(fn));
    },
    ap: function(functor) {
      return functor.map(function(fn) {
        return promise.then(fn);
      });
    },
    cata: function(success, err) {
      return promise.then(success).catch(err);
    },

    is_future: true
  };
}

Future.of = function(val) {
  return Future(Promise.resolve(val));
};

export { Future };
