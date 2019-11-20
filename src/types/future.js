function Future(promise) {
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

    alt: function(value) {
      if (value.is_future) {
        return Future(
          promise.catch(function() {
            return value.join();
          })
        );
      }

      return Future(
        promise.catch(function() {
          return value;
        })
      );
    },
    altchain: function(fn) {
      return Future(promise.catch(fn));
    },
    filter: function(predicate) {
      var fn = function(value) {
        var result = predicate(value);

        if (result.then) {
          result.then(function(unwrapped) {
            return unwrapped ? value : Promise.reject(false);
          });
        }

        return result ? value : Promise.reject(false);
      };

      return Future(promise.then(fn));
    },
    join: function() {
      return promise;
    },

    is_future: true
  };
}

Future.of = function(val) {
  return Future(Promise.resolve(val));
};

export { Future };
