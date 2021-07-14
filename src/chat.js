const lineRegex = /(?:@(?<tags>\S+) )?:(?<pref>\S+) (?<cmd>\S+)(?: (?<args>.+))?\r/

export const chat = async (channel) => {
  let res = null
  let running = null
  const evts = []
  const username = `justinfan${Math.floor(Math.random() * 1e5)}`
  const ws = await new Promise((resolve, reject) => {
    const w = new WebSocket('wss://irc-ws.chat.twitch.tv:443')
    w.onerror = (err) => reject(err)
    w.onopen = () => {
      [
        `CAP REQ :twitch.tv/tags`,
        `NICK ${username}`,
        `JOIN #${channel}`,
      ].map((i) => w.send(i))
      resolve(w)
    }
  })
  ws.addEventListener('message', (m) => {
    m.data.split('\n').forEach((line) => {
      if (!line) return
      if (line.slice(0, 4) === 'PING') return ws.send(line.replace('I', 'O'))
      const { tags, pref, cmd, args } = line.match(lineRegex)?.groups || {}
      if (cmd !== 'PRIVMSG') return
      evts.push({
        user: pref.split('!')[0],
        text: args.split(' :', 2)[1],
        tags: Object.fromEntries(tags?.split(';').map((t) => t.split('=')) || [])
      })
      if (res) {
        res()
        res = null
      }
    })
  })
  ws.addEventListener('close', () => { running = false })
  running = true
  async function * messages () {
    while (running) {
      while (evts.length) {
        yield evts.shift()
      }
      await new Promise((resolve) => { res = resolve })
    }
  }
  return {
    messages,
  }
}
