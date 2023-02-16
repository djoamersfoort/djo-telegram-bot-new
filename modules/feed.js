const Parser = require('rss-parser')
const fs = require('fs')
const config = require('../data/config.json')
const templates = require('./templateManager')

class Feed {
  constructor (bot) {
    this.bot = bot

    this.parse().then()
    setInterval(this.parse, 5 * 60 * 1000)
  }

  async message (item) {
    await this.bot.telegram.sendMessage(config.channel, templates.render('post', item), { parse_mode: 'Markdown' })
  }

  async parse () {
    let parsed = fs.existsSync('./data/guids.json') ? JSON.parse(fs.readFileSync('./data/guids.json').toString()) : []
    let res
    try {
      let parser = new Parser()
      res = await parser.parseURL('https://www.djoamersfoort.nl/feed/')
    } catch (e) {
      console.log(e)
      return
    }
    const { items } = res

    items.forEach(item => {
      if (parsed.includes(item.guid)) return
      this.message(item)
      parsed.push(item.guid)
    })
    fs.writeFileSync('./data/guids.json', JSON.stringify(parsed))
  }
}

module.exports = Feed
