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
const taxonomy = require('../..')

// See https://arxiv.org/abs/2201.02089
tap.test('should categorize the survey test object', (test) => {
  const document = {
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

  test.strictSame(taxonomy(document), [
    'tier 2',
    'numeric',
    'non-redundant',
    'nested'
  ])

  test.end()
})

tap.test('should categorize an empty object', (test) => {
  const document = {}

  test.strictSame(taxonomy(document), [
    'tier 1',
    'structural',
    'non-redundant',
    'flat'
  ])

  test.end()
})

tap.test('should categorize a purely structural object', (test) => {
  const document = {
    foo: {
      bar: [],
      baz: []
    }
  }

  test.strictSame(taxonomy(document), [
    'tier 1',
    'structural',
    'redundant',
    'flat'
  ])

  test.end()
})

tap.test('should categorize a purely structural nested object', (test) => {
  const document = {
    foo: {
      bar: [],
      baz: [
        {
          foo: {
            bar: [
              {
                foo: {
                  bar: []
                }
              }
            ]
          }
        }
      ]
    }
  }

  test.strictSame(taxonomy(document), [
    'tier 1',
    'structural',
    'non-redundant',
    'nested'
  ])

  test.end()
})
