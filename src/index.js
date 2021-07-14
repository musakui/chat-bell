import './index.css'
const params = new URLSearchParams(window.location.search)
params.get('channel')
  ? import('./main.js').then(({ init }) => init(Object.fromEntries(params.entries())))
  : import('./intro.js')
