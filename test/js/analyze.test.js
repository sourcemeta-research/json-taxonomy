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
const analyze = require('../../js/analyze')

// See https://arxiv.org/abs/2201.02089
tap.test('should analyze the survey object', (test) => {
  const value = {
    tags: [],
    tz: -25200,
    days: [1, 1, 2, 1],
    coord: [-90.0715, 29.951],
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

  const result = analyze(value)

  test.strictSame(result, {
    size: 184,
    count: 24,
    height: 4,
    levels: [
      {
        count: 1,
        size: 184
      },
      {
        count: 1,
        size: 6
      },
      {
        count: 6,
        size: 18
      },
      {
        count: 6,
        size: 29
      },
      {
        count: 1,
        size: 2
      }
    ],
    values: {
      textual: {
        count: 3,
        duplicates: 1,
        size: 14
      },
      numeric: {
        count: 7,
        duplicates: 2,
        size: 24
      },
      boolean: {
        count: 4,
        duplicates: 1,
        size: 17
      },
      structural: {
        count: 10,
        duplicates: 1,
        size: 129
      }
    }
  })

  test.equal(result.levels[0].count, 1)
  test.equal(result.levels[0].size, result.size)

  test.equal(result.count,
    result.values.textual.count +
    result.values.numeric.count +
    result.values.boolean.count +
    result.values.structural.count)

  test.equal(result.size,
    result.values.textual.size +
    result.values.numeric.size +
    result.values.boolean.size +
    result.values.structural.size)

  test.end()
})

tap.test('integrity of count', (test) => {
  fc.assert(fc.property(fc.json(), (value) => {
    const result = analyze(value)
    return result.count ===
      result.values.textual.count +
      result.values.numeric.count +
      result.values.boolean.count +
      result.values.structural.count
  }), {
    verbose: false
  })

  test.end()
})

tap.test('integrity of size', (test) => {
  fc.assert(fc.property(fc.json(), (value) => {
    const result = analyze(value)
    return result.size ===
      result.values.textual.size +
      result.values.numeric.size +
      result.values.boolean.size +
      result.values.structural.size
  }), {
    verbose: false
  })

  test.end()
})

tap.test('integrity of levels', (test) => {
  fc.assert(fc.property(fc.json(), (value) => {
    const result = analyze(value)
    return result.levels[0].size === result.size &&
      result.levels[0].count === 1 &&
      result.height === result.levels.length - 1
  }), {
    verbose: false
  })

  test.end()
})
