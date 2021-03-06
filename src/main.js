import { chat } from './chat.js'

const link = (u, name) => `<a href="https://twitch.tv/${u}">${name}</a>`

const createItem = ({ user, text, tags }) => {
  const li = document.createElement('li')
  li.innerHTML = `${link(user, tags['display-name'])}: <span>${text}</span>`
  return li
}

export const init = async (opts) => {
  if (!opts.channel) return
  const sound = new Audio(opts.url || (import.meta.env.BASE_URL + 'chirin.mp3'))
  if (opts.volume) { sound.volume = parseFloat(opts.volume) }
  const list = document.createElement(opts.el || 'ul')
  const chan = opts.channel.toLowerCase()
  const seen = new Set([chan])
  const igns = opts.ignore?.toLowerCase()
  if (igns) {
    console.log('ignore:', igns.split(/[, ]/).map((i) => (seen.add(i), i)))
  }
  const glowDuration = (opts.glows || 15) * 1000

  let res = null
  const start = document.querySelector('a')
  start.onclick = () => {
    start.style.display = 'none'
    res()
  }
  start.style.display = 'block'
  await new Promise((resolve) => { res = resolve })

  const { messages } = await chat(chan)
  const head = document.createElement('div')
  head.innerHTML = `connected to ${chan} <a href="?">reset</a>`
  document.body.append(head, list)

  for await (const evt of messages()) {
    if (seen.has(evt.user)) continue
    seen.add(evt.user)
    sound.play()
    console.log('NEW', [evt.user, evt.text])
    const li = createItem(evt)
    list.appendChild(li)
    setTimeout(() => li.classList.add('done'), glowDuration)
    setTimeout(() => { list.scrollTop = list.scrollHeight }, 100)
  }
}
