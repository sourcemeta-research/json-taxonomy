/*
 * Copyright 2022 Juan Cruz Viotti
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const tap = require('tap')
const fc = require('fast-check')
const json = require('../../js/json')

tap.test('should calculate the byte size of a one-digit integer', (test) => {
  test.strictSame(json.byteSize(5), {
    scalar: 1,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of a negative one-digit integer', (test) => {
  test.strictSame(json.byteSize(-2), {
    scalar: 2,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of a three-digit integer', (test) => {
  test.strictSame(json.byteSize(556), {
    scalar: 3,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of a real number', (test) => {
  test.strictSame(json.byteSize(53.892), {
    scalar: 6,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of the true boolean', (test) => {
  test.strictSame(json.byteSize(true), {
    scalar: 4,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of the false boolean', (test) => {
  test.strictSame(json.byteSize(false), {
    scalar: 5,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of null', (test) => {
  test.strictSame(json.byteSize(null), {
    scalar: 4,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of an empty string', (test) => {
  test.strictSame(json.byteSize(''), {
    scalar: 2,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of a non-empty string', (test) => {
  test.strictSame(json.byteSize('foobar'), {
    scalar: 8,
    structural: 0
  })

  test.end()
})

tap.test('should calculate the byte size of an empty array', (test) => {
  test.strictSame(json.byteSize([]), {
    scalar: 0,
    structural: 2
  })

  test.end()
})

tap.test('should calculate the byte size of a non-empty array of scalars', (test) => {
  test.strictSame(json.byteSize(['foo', true, null, 3]), {
    scalar: 5 + 4 + 4 + 1,
    structural: 2 + 1 + 1 + 1
  })

  test.end()
})

tap.test('should calculate the byte size of an empty object', (test) => {
  test.strictSame(json.byteSize({}), {
    scalar: 0,
    structural: 2
  })

  test.end()
})

tap.test('should calculate the byte size of an object with one scalar value', (test) => {
  test.strictSame(json.byteSize({ foo: 4 }), {
    scalar: 1,
    structural: 2 + 5 + 1
  })

  test.end()
})

// See https://arxiv.org/abs/2201.02089
tap.test('should calculate the byte size of the survey test object', (test) => {
  test.strictSame(json.byteSize({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }), {
    scalar: 55,
    structural: 129
  })

  test.end()
})

tap.test('scalar + structural byte size', (test) => {
  fc.assert(fc.property(fc.json(), (value) => {
    const result = json.byteSize(value)
    const total = Buffer.byteLength(JSON.stringify(value), 'utf8')
    return total === result.scalar + result.structural
  }), {
    verbose: false
  })

  test.end()
})

tap.test('should get the deep values of a scalar', (test) => {
  test.strictSame(json.deepValues(5), [5])
  test.end()
})

tap.test('should get the deep values of an array of scalar', (test) => {
  test.strictSame(json.deepValues(['foo', 5, true]), [
    ['foo', 5, true],
    'foo',
    5,
    true
  ])

  test.end()
})

tap.test('should get the deep values of an empty array', (test) => {
  test.strictSame(json.deepValues([]), [[]])
  test.end()
})

tap.test('should get the deep values of an empty object', (test) => {
  test.strictSame(json.deepValues({}), [{}])
  test.end()
})

tap.test('should get the deep values of object of scalars', (test) => {
  test.strictSame(json.deepValues({ foo: 1, bar: true }), [
    { foo: 1, bar: true },
    1,
    true
  ])

  test.end()
})

tap.test('should get the deep values of a complex object', (test) => {
  test.strictSame(json.deepValues({
    foo: 1,
    bar: {
      baz: ['hello']
    },
    qux: [
      {
        extra: null
      }
    ]
  }), [
    {
      foo: 1,
      bar: {
        baz: ['hello']
      },
      qux: [
        {
          extra: null
        }
      ]
    },
    1,
    {
      baz: ['hello']
    },
    ['hello'],
    'hello',
    [
      {
        extra: null
      }
    ],
    {
      extra: null
    },
    null
  ])

  test.end()
})

tap.test('should get the height of an empty object', (test) => {
  test.equal(json.height({}), 1)
  test.end()
})

tap.test('should get the height of a scalar object', (test) => {
  test.equal(json.height({ foo: 1 }), 1)
  test.end()
})

tap.test('should get the height of an object with an array', (test) => {
  test.equal(json.height({ foo: [1] }), 2)
  test.end()
})

tap.test('should get the height of the survey object', (test) => {
  test.equal(json.height({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }), 4)

  test.end()
})

tap.test('should get the level 0 of a scalar', (test) => {
  test.strictSame(json.level('foo', 0), ['foo'])
  test.end()
})

tap.test('should get the level 1 of a scalar', (test) => {
  test.strictSame(json.level('foo', 1), [])
  test.end()
})

tap.test('should get the level 1 of an object of scalars', (test) => {
  test.strictSame(json.level({ foo: 1, bar: true }, 1), [
    1,
    true
  ])

  test.end()
})

tap.test('should get the level 1 of a complex object', (test) => {
  test.strictSame(json.level({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }, 1), [
    -25200
  ])

  test.end()
})

tap.test('should get the level 2 of a complex object', (test) => {
  test.strictSame(json.level({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }, 2), [
    1,
    1,
    2,
    1,
    -90.0715,
    29.951
  ])

  test.end()
})

tap.test('should get the level 3 of a complex object', (test) => {
  test.strictSame(json.level({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }, 3), [
    'ox03',
    true,
    null,
    false,
    'ox03',
    true
  ])

  test.end()
})

tap.test('should get the level 4 of a complex object', (test) => {
  test.strictSame(json.level({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }, 4), [
    ''
  ])

  test.end()
})

tap.test('should get the invalid level 5 of a complex object', (test) => {
  test.strictSame(json.level({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }, 5), [])

  test.end()
})

tap.test('should get the level 0 of a complex object', (test) => {
  test.strictSame(json.level({
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.9510],
    data: [
      {
        name: 'ox03',
        staff: true
      },
      {
        name: null,
        staff: false,
        extra: {
          info: ''
        }
      },
      {
        name: 'ox03',
        staff: true
      },
      {}
    ]
  }, 0), [
    {
      tags: [],
      tz: -25200,
      days: [1, 1, 2, 1],
      coord: [-90.0715, 29.9510],
      data: [
        {
          name: 'ox03',
          staff: true
        },
        {
          name: null,
          staff: false,
          extra: {
            info: ''
          }
        },
        {
          name: 'ox03',
          staff: true
        },
        {}
      ]
    }
  ])

  test.end()
})
