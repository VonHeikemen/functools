import { strict as t } from 'assert';
import { Lens } from '../../src/utils/lens';
import { compose } from '../../src/utils';

suite('# Lenses');

var alice = {
  name: 'Alice Jones',
  address: ['22 Walnut St', 'San Francisco', 'CA'],
  pets: { dog: 'joker', cat: 'batman' }
};

var name_lens = Lens.prop('name');
var address_lens = Lens.prop('address');
var head_lens = Lens.prop(0);
var dog_lens = Lens.path(['pets', 'dog']);

test('view lenses created by Lens.path', function() {
  t.equal(Lens.view(dog_lens, alice), 'joker');
});

test('view lenses created by Lens.prop', function() {
  t.equal(Lens.view(name_lens, alice), 'Alice Jones');
});

test('apply Lens.over', function() {
  var to_upper = str => str.toUpperCase();

  var uppercase_alice = {
    name: 'ALICE JONES',
    address: ['22 Walnut St', 'San Francisco', 'CA'],
    pets: { dog: 'joker', cat: 'batman' }
  };

  var new_alice = Lens.over(name_lens, to_upper, alice);

  t.deepEqual(new_alice, uppercase_alice, '');
});

test('apply Lens.set', function() {
  var expected_alice = {
    name: 'Alice Smith',
    address: ['22 Walnut St', 'San Francisco', 'CA'],
    pets: { dog: 'joker', cat: 'batman' }
  };

  var new_alice = Lens.set(name_lens, 'Alice Smith', alice);

  t.deepEqual(new_alice, expected_alice);
});

test('works on arrays', function() {
  var to_upper = str => str.toUpperCase();

  t.deepEqual(Lens.view(head_lens, alice.address), '22 Walnut St');

  t.deepEqual(
    Lens.over(head_lens, to_upper, alice.address),
    ['22 WALNUT ST', 'San Francisco', 'CA'],
    ''
  );

  t.deepEqual(
    Lens.set(head_lens, '52 Crane Ave', alice.address),
    ['52 Crane Ave', 'San Francisco', 'CA'],
    ''
  );
});

test('can be composed', function() {
  var to_upper = str => str.toUpperCase();

  var street_lens = compose(address_lens, head_lens);
  var get_dog = compose(Lens.path(['pets']), Lens.path(['dog']));

  t.deepEqual(Lens.view(get_dog, alice), 'joker');
  t.deepEqual(Lens.view(Lens.path(['pets', 'dog']), alice), 'joker');

  t.equal(Lens.view(street_lens, alice), '22 Walnut St');

  t.deepEqual(
    Lens.over(street_lens, to_upper, alice),
    {
      name: 'Alice Jones',
      address: ['22 WALNUT ST', 'San Francisco', 'CA'],
      pets: { dog: 'joker', cat: 'batman' }
    },
    ''
  );

  t.deepEqual(
    Lens.set(street_lens, '52 Crane Ave', alice),
    {
      name: 'Alice Jones',
      address: ['52 Crane Ave', 'San Francisco', 'CA'],
      pets: { dog: 'joker', cat: 'batman' }
    },
    ''
  );
});
