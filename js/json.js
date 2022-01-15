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

const values = (value) => {
  if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
    return Object.values(value)
  } else if (Array.isArray(value)) {
    return value
  } else {
    return []
  }
}

const utf8size = (string) => {
  return new TextEncoder().encode(string).byteLength
}

exports.byteSize = (value) => {
  if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return values(value).map(exports.byteSize).concat({
      scalar: 0,
      structural: Array.isArray(value)
        ? 2 + Math.max(value.length, 1) - 1
        : Object.keys(value).length +
          utf8size(JSON.stringify(Object.keys(value)))
    }).reduce((accumulator, size) => {
      return {
        scalar: accumulator.scalar + size.scalar,
        structural: accumulator.structural + size.structural
      }
    })
  } else {
    return {
      scalar: utf8size(JSON.stringify(value)),
      structural: 0
    }
  }
}

exports.deepValues = (value) => {
  return (Array.isArray(value) || (typeof value === 'object' && value !== null))
    ? values(value).reduce((accumulator, element) => {
        return accumulator.concat(exports.deepValues(element))
      }, [value])
    : [value]
}

exports.height = (value) => {
  return (Array.isArray(value) || (typeof value === 'object' && value !== null))
    ? 1 + Math.max(...values(value).map(exports.height).concat(0))
    : 0
}

exports.level = (value, level) => {
  if (level === 0) {
    return [value]
  } else if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
    return level <= 1
      ? values(value).filter((element) => {
          return (typeof element !== 'object' || element === null) && !Array.isArray(element)
        })
      : values(value).reduce((accumulator, element) => {
        return accumulator.concat(exports.level(element, level - 1))
      }, [])
  } else {
    return []
  }
}
