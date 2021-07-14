import './intro.css'
import mainHtml from './intro.html?raw'
const main = document.createElement('main')
main.innerHTML = mainHtml
document.body.append(main)
