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

const analyze = require('./analyze')

function percentage (total, local) {
  return total === 0 ? 0 : local * 100 / total
}

module.exports = (value) => {
  const analysis = analyze(value)
  const qualifiers = []

  // Size characteristics
  if (analysis.size < 100) {
    qualifiers.push('tier 1')
  } else if (analysis.size < 1000) {
    qualifiers.push('tier 2')
  } else {
    qualifiers.push('tier 3')
  }

  // Content characteristics
  const textualWeight = analysis.values.textual.count * analysis.values.textual.size
  const numericWeight = analysis.values.numeric.count * analysis.values.numeric.size
  const booleanWeight = analysis.values.boolean.count * analysis.values.boolean.size
  if (textualWeight === 0 && numericWeight === 0 && booleanWeight === 0) {
    qualifiers.push('structural')
  } else if (textualWeight >= numericWeight && textualWeight >= booleanWeight) {
    qualifiers.push('textual')
  } else if (numericWeight >= textualWeight && numericWeight >= booleanWeight) {
    qualifiers.push('numeric')
  } else if (booleanWeight >= textualWeight && booleanWeight >= numericWeight) {
    qualifiers.push('boolean')
  }

  // Redundancy characteristics
  const duplicates = analysis.values.textual.duplicates +
    analysis.values.numeric.duplicates +
    analysis.values.boolean.duplicates +
    analysis.values.structural.duplicates
  if (percentage(analysis.count, duplicates) >= 25) {
    qualifiers.push('redundant')
  } else {
    qualifiers.push('non-redundant')
  }

  // Nesting characteristics
  const largestLevel = analysis.levels.slice(1).map((level, index) => {
    return { index: index + 1, ...level }
  }).sort((left, right) => {
    return right.size - left.size
  })[0]
  if (textualWeight === 0 && numericWeight === 0 && booleanWeight === 0 && analysis.height >= 5) {
    qualifiers.push('nested')
  } else if (analysis.height * largestLevel.index >= 10) {
    qualifiers.push('nested')
  } else {
    qualifiers.push('flat')
  }

  return qualifiers
}
