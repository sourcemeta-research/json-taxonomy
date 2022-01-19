#!/usr/bin/env node

const fs = require('fs')
const taxonomy = require('..')
const INPUT = process.argv[2]

if (!INPUT) {
  console.error(`${process.argv[0]} ${process.argv[1]} <document.json>`)
  process.exit(1)
}

fs.accessSync(INPUT, fs.constants.R_OK)
const value = JSON.parse(fs.readFileSync(INPUT, 'utf8'))

console.log(taxonomy(value).map((qualifier) => {
  return qualifier[0].toUpperCase() + qualifier.slice(1)
}).join(', '))
