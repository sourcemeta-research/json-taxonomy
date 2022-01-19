Taxonomy for JSON documents
===========================

This project presents a formal taxonomy to classify
[JSON](https://www.json.org) documents based on their size, type of content,
characteristics of their structure and redundancy criteria.

![JSON Taxonomy Online Tool Screenshot](./screenshot.png)

Open the online demo [here](https://sourcemeta.github.io/json-taxonomy).

Why is this useful?
-------------------

Software systems make use of JSON to model diverse and domain-specific data
structures. Each of these data structures have characteristics that distinguish
them from other data structures. For example, a data structure that models a
person is fundamentally different from a data structure that models sensor
data. These characteristics describe the essence of the data structure.
Therefore, two instances of the same data structure inherit the same or similar
characteristics despite having different values.

While we intuitively know these characteristics exist, we lack a common
terminology to describe them in unambiguous ways. In an attempt to solve this
problem, this taxonomy presents a formal vocabulary to describe, reason and
talk about JSON documents in a high-level manner given the characteristics of
the data structures they represent.

Taxonomy
--------

The taxonomy aims to classify JSON documents into a limited and useful set of
categories that is easy to reason about rather than exhaustively considering
every possible aspect of a data structure. The taxonomy categorizes JSON
documents according to their size, content, redundancy and nesting
characteristics.

### Size

- **Tier 1**: A JSON document is in this category if its UTF-8 minified form
  occupies less than 100 bytes.

- **Tier 2**: A JSON document is in this category if its UTF-8 minified form
  occupies 100 bytes or more, but less than 1000 bytes.

- **Tier 3**: A JSON document is in this category if its UTF-8 minified form
  occupies 1000 bytes or more.

### Content

- **Textual**: A JSON document is in this category if it has at least one
  string value and its number of string values multiplied by the cummulative
  byte-size occupied by its string values is greater than or equal to the
  boolean and numeric counterparts.

- **Numeric**: A JSON document is in this category if it has at least one
  number value and its number of number values multiplied by the cummulative
  byte-size occupied by its number values is greater than or equal to the
  textual and boolean counterparts.

- **Boolean**: A JSON document is in this category if it has at least one
  boolean or null value and its number of boolean and null values multiplied by
  the cummulative byte-size occupied by its boolean and null values is greater
  than or equal to the textual and numeric counterparts.

- **Structural**: A JSON document is in this category if it does not include
  any string, boolean, null or number values.

A JSON document can be categorizes as textual, numeric and boolean at the same
time.

### Redundancy

- **Non-redundant**: A JSON document is in this category if less than 25%
  percent of its scalar and composite values are redundant.

- **Redundant**: A JSON document is in this category if at least 25% percent of
  its scalar and composite values are redundant.

### Nesting

- **Flat**: A JSON document is in this category if the height of the document
  multiplied by the non-root level with the largest byte-size when taking
  textual, numeric and boolean values into account is less than 10. If two
  levels have the byte size, the highest level is taken into account.

- **Nested**: A JSON document is in this category if it is considered
  *structural* and its height is greater than or equal to 5, or if the height
  of the document multiplied by the non-root level with the largest byte-size
  when taking textual, numeric and boolean values into account is greater than
  or equal to 10. If two levels have the byte size, the highest level is taken
  into account.

Usage (JavaScript)
------------------

This repository publishes an [npm](https://www.npmjs.com) package which can be
installed as follows:

```sh
npm install --save @sourcemeta/json-taxonomy
```

The module exposes a single function that takes any JSON value and returns the
sequence of taxonomy qualifiers as an array of strings:

```js
const taxonomy = require('@sourcemeta/json-taxonomy')

const value = {
  foo: 2
}

console.log(taxonomy(value))
// [ 'tier 1', 'numeric', 'non-redundant', 'flat' ]
```

Usage (CLI)
-----------

The published [npm](https://www.npmjs.com) package includes a simple
command-line interface program that can be globally installed as follows:

```sh
npm install --global @sourcemeta/json-taxonomy
```

The CLI program takes the path to a JSON document as an argument and outputs
the taxonomy to standard output:

```sh
json-taxonomy path/to/document.json
```

License
-------

This project is released under the terms specified in the
[license](https://github.com/sourcemeta/json-taxonomy/blob/master/LICENSE).
This project extends [previous academic work](https://arxiv.org/abs/2201.03051)
by the same author at University of Oxford.
