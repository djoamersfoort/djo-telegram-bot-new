import Parser from 'rss-parser'
import fs from 'fs'
import { config } from '../config.js'
import templates from './templateManager.js'

class Feed {
  constructor (public bot: Bot) {
    this.parse().then()
    setInterval(this.parse.bind(this), 5 * 60 * 1000)
  }

  async message (item: Record<string, string>) {
    await this.bot.telegram.sendMessage(config.channel, templates.render('post', item), { parse_mode: 'Markdown' })
  }

  async parse () {
    const parsed = fs.existsSync('./data/guids.json') ? JSON.parse(fs.readFileSync('./data/guids.json').toString()) : []
    let res
    try {
      const parser = new Parser()
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

export { Feed }
