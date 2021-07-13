import audioURL from './chirin.mp3'

const lineRegex = /:(?<pref>\S+) (?<cmd>\S+)(?: (?<args>.+))?\r/

export const init = async ({ channel, ignore, volume, url }) => {
  if (!channel) return
  const sound = new Audio(url || audioURL)
  if (volume) { sound.volume = parseFloat(volume) }
  const welcomed = new Set([channel, ...(ignore?.split(',') ?? [])])
  const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
  const username = `justinfan${Math.floor(Math.random() * 1e5)}`
  ws.addEventListener('open', () => [`NICK ${username}`, `JOIN #${channel}`].map((i) => ws.send(i)))
  ws.addEventListener('message', (m) => {
    m.data.split('\n').forEach((line) => {
      if (!line) return
      if (line.slice(0, 4) === 'PING') return ws.send(line.replace('I', 'O'))
      const { pref, cmd, args } = line.match(lineRegex)?.groups || {}
      if (cmd !== 'PRIVMSG') return
      const user = pref.split('!')[0]
      if (welcomed.has(user)) return
      welcomed.add(user)
      sound.play()
      console.log('WELCOME', user, args.split(' :', 2)[1])
    })
  })
}

const params = new URLSearchParams(window.location.search)
init(Object.fromEntries('channel,ignore,volume,url'.split(',').map((n) => [n, params.get(n)])))
