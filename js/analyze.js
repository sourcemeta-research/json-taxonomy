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

const json = require('./json')

const isDeepEqual = (left, right) => {
  if (typeof left === 'object' && !Array.isArray(left) && left !== null) {
    if (typeof right !== 'object' || Array.isArray(right) || right === null) {
      return false
    } else if (Object.keys(left).length !== Object.keys(right).length) {
      return false
    }

    for (const key of Object.keys(left)) {
      if (!isDeepEqual(left[key], right[key])) {
        return false
      }
    }

    return true
  } else if (Array.isArray(left)) {
    if (!Array.isArray(right)) {
      return false
    } else if (left.length !== right.length) {
      return false
    }

    for (const [index, value] of left.entries()) {
      if (!isDeepEqual(value, right[index])) {
        return false
      }
    }

    return true
  }

  return left === right
}

const uniqueDeep = (values) => {
  return values.reduce((accumulator, element) => {
    if (typeof accumulator.find(isDeepEqual.bind(null, element)) === 'undefined') {
      accumulator.push(element)
    }

    return accumulator
  }, [])
}

module.exports = (value) => {
  const byteSize = json.byteSize(value)
  const values = json.deepValues(value)
  const height = json.height(value)

  const textual = values.filter((element) => typeof element === 'string')
  const numeric = values.filter((element) => typeof element === 'number')
  const boolean = values.filter((element) => typeof element === 'boolean' || element === null)
  const structural = values.filter((element) =>
    (typeof element === 'object' && element !== null) || Array.isArray(element))

  return {
    size: byteSize.scalar + byteSize.structural,
    count: values.length,
    height,
    levels: [...Array(height + 1).keys()].map((level) => {
      const elements = json.level(value, level)
      return {
        count: elements.length,
        size: elements.map(json.byteSize).reduce((accumulator, size) => {
          return accumulator + size.scalar + size.structural
        }, 0)
      }
    }),
    values: {
      textual: {
        count: textual.length,
        duplicates: textual.length - (new Set(textual)).size,
        size: textual.map(json.byteSize).reduce((accumulator, size) => {
          return accumulator + size.scalar
        }, 0)
      },
      numeric: {
        count: numeric.length,
        duplicates: numeric.length - (new Set(numeric)).size,
        size: numeric.map(json.byteSize).reduce((accumulator, size) => {
          return accumulator + size.scalar
        }, 0)
      },
      boolean: {
        count: boolean.length,
        duplicates: boolean.length - (new Set(boolean)).size,
        size: boolean.map(json.byteSize).reduce((accumulator, size) => {
          return accumulator + size.scalar
        }, 0)
      },
      structural: {
        count: structural.length,
        duplicates: structural.length - uniqueDeep(structural).length,
        size: byteSize.structural
      }
    }
  }
}
