import CodeMirror from 'codemirror'
import 'codemirror/mode/javascript/javascript'
import { Chart } from 'chart.js/dist/chart'
import analyze from '../js/analyze'
import taxonomy from '..'
/* global FileReader */

// From https://arxiv.org/abs/2201.02089
const EXAMPLE_JSON = {
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

const code = CodeMirror(document.getElementById('editor'), {
  lineNumbers: true,
  value: JSON.stringify(EXAMPLE_JSON, null, 2),
  theme: 'idea',
  mode: 'javascript'
})

function percentage (total, local) {
  const value = total === 0 ? 0 : local * 100 / total
  return `${value.toFixed(2).replace(/\.0+$/, '')}%`
}

function doughnut (element, options) {
  return new Chart(element, {
    type: 'doughnut',
    data: {
      labels: options.labels,
      datasets: [
        {
          data: options.data,
          backgroundColor: options.colors
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: options.title
        }
      }
    }
  })
}

const CHART_PALETTE = [
  '#DB7F7E',
  '#9E6363',
  '#83D9D9',
  '#69A0A0'
]

const CHART_CONTENT_TYPE = doughnut(document.getElementById('chart-content-type'), {
  title: 'Number of Values by Content Type',
  labels: ['Textual', 'Numeric', 'Boolean', 'Structural'],
  data: [0, 0, 0, 0],
  colors: CHART_PALETTE
})

const CHART_BYTE_SIZE = doughnut(document.getElementById('chart-byte-size'), {
  title: 'Byte-size of Values by Content Type',
  labels: ['Textual', 'Numeric', 'Boolean', 'Structural'],
  data: [0, 0, 0, 0],
  colors: CHART_PALETTE
})

function render (qualifiers, analysis) {
  document.getElementById('json-error').style.display = 'none'
  document.getElementById('json-result').style.display = 'block'

  CHART_CONTENT_TYPE.data.datasets[0].data = [
    analysis.values.textual.count,
    analysis.values.numeric.count,
    analysis.values.boolean.count,
    analysis.values.structural.count
  ]
  CHART_CONTENT_TYPE.update()

  CHART_BYTE_SIZE.data.datasets[0].data = [
    analysis.values.textual.size,
    analysis.values.numeric.size,
    analysis.values.boolean.size,
    analysis.values.structural.size
  ]
  CHART_BYTE_SIZE.update()

  document.getElementById('qualifiers').innerHTML = qualifiers.map((qualifier) => {
    return qualifier[0].toUpperCase() + qualifier.slice(1)
  }).join(', ')

  document.getElementById('analysis.size').innerHTML = String(analysis.size)
  document.getElementById('analysis.count').innerHTML = String(analysis.count)
  document.getElementById('analysis.height').innerHTML = String(analysis.height)
  document.getElementById('analysis.duplicates').innerHTML = String(
    analysis.values.textual.duplicates +
    analysis.values.numeric.duplicates +
    analysis.values.boolean.duplicates +
    analysis.values.structural.duplicates)

  document.getElementById('analysis.textual.size').innerHTML = percentage(analysis.size, analysis.values.textual.size)
  document.getElementById('analysis.textual.count').innerHTML = percentage(analysis.count, analysis.values.textual.count)
  document.getElementById('analysis.textual.duplicates').innerHTML = percentage(analysis.count, analysis.values.textual.duplicates)
  document.getElementById('analysis.numeric.size').innerHTML = percentage(analysis.size, analysis.values.numeric.size)
  document.getElementById('analysis.numeric.count').innerHTML = percentage(analysis.count, analysis.values.numeric.count)
  document.getElementById('analysis.numeric.duplicates').innerHTML = percentage(analysis.count, analysis.values.numeric.duplicates)
  document.getElementById('analysis.boolean.size').innerHTML = percentage(analysis.size, analysis.values.boolean.size)
  document.getElementById('analysis.boolean.count').innerHTML = percentage(analysis.count, analysis.values.boolean.count)
  document.getElementById('analysis.boolean.duplicates').innerHTML = percentage(analysis.count, analysis.values.boolean.duplicates)
  document.getElementById('analysis.structural.size').innerHTML = percentage(analysis.size, analysis.values.structural.size)
  document.getElementById('analysis.structural.count').innerHTML = percentage(analysis.count, analysis.values.structural.count)
  document.getElementById('analysis.structural.duplicates').innerHTML = percentage(analysis.count, analysis.values.structural.duplicates)

  const levels = document.getElementById('analysis.levels')
  // Clear levels table
  while (levels.lastChild) {
    levels.removeChild(levels.lastChild)
  }

  for (const [index, level] of analysis.levels.entries()) {
    const id = document.createElement('td')
    const values = document.createElement('td')
    const size = document.createElement('td')

    id.innerHTML = String(index)
    values.innerHTML = percentage(analysis.count, level.count)
    size.innerHTML = percentage(analysis.size, level.size)

    const row = document.createElement('tr')
    row.appendChild(id)
    row.appendChild(values)
    row.appendChild(size)
    levels.appendChild(row)
  }
}

function safeJSON (string) {
  try {
    return JSON.parse(string)
  } catch (error) {
    // Because undefined is impossible on JSON
    return undefined
  }
}

function onAnalyze (value) {
  const jsonDocument = safeJSON(value)
  if (typeof jsonDocument === 'undefined') {
    document.getElementById('json-error').style.display = 'block'
    document.getElementById('json-result').style.display = 'none'
  } else {
    render(taxonomy(jsonDocument), analyze(jsonDocument))
  }
}

const LoaderElement = document.createElement('div')
LoaderElement.classList.add('loader')
const fileInputElement = document.getElementById('fileInput')

function showLoader (bool) {
  if (bool) {
    document.querySelector('main').appendChild(LoaderElement)
    document.getElementById('overlay').style.display = 'block'
  } else {
    document.querySelector('main').removeChild(LoaderElement)
    document.getElementById('overlay').style.display = 'none'
  }
}

function analyzer () {
  const file = fileInputElement.files[0]
  showLoader(true)
  if (file) {
    if (file.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = function (event) {
        const contents = event.target.result
        onAnalyze(contents)
        showLoader(false)
      }
      reader.readAsText(file)
    } else {
      console.error('Please select a JSON file.')
    }
  } else {
    code.getWrapperElement().style.display = ''
    onAnalyze(code.getValue())
    showLoader(false)
  }
}

document.getElementById('remove').addEventListener('click', () => {
  fileInputElement.value = ''
  code.getWrapperElement().style.display = ''
})

fileInputElement.addEventListener('change', (e) => {
  if (e.target.files[0]) {
    code.getWrapperElement().style.display = 'none'
  }
})

document.getElementById('analyze').addEventListener('click', analyzer)

onAnalyze(code.getValue())
