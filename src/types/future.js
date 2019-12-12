function Future(promise) {
  return {
    map: function(fn) {
      return Future(promise.then(fn));
    },
    ap: function(functor) {
      return functor.map(function _ap(fn) {
        return promise.then(fn);
      });
    },
    cata: function(success, err) {
      return promise.then(success).catch(err);
    },

    alt: function(value) {
      if (value.is_future) {
        return Future(
          promise.catch(function _altfuture() {
            return value.join();
          })
        );
      }

      return Future(
        promise.catch(function _alt() {
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
          result.then(function _filter(unwrapped) {
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
