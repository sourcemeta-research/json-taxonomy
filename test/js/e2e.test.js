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
const fs = require('fs')
const path = require('path')
const taxonomy = require('../..')
const E2E_PATH = path.resolve(__dirname, '..', 'e2e')

for (const filePath of fs.readdirSync(E2E_PATH)) {
  const testCase = JSON.parse(fs.readFileSync(path.resolve(E2E_PATH, filePath), 'utf8'))
  tap.test(`e2e: ${testCase.name}`, (test) => {
    const result = taxonomy(testCase.document)
    test.strictSame(result, testCase.expected)
    test.end()
  })
}
