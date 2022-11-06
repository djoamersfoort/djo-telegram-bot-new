const fetch = require('node-fetch')
const templates = require('./templateManager')

class Search {
  constructor (bot) {
    this.inventoryApi = 'https://inventory.djoamersfoort.nl/api/v1'
    this.bot = bot
    this.bot.command('search', ctx => this.command(ctx))
  }

  parseArgs (ctx) {
    return ctx.update.message.text.split(' ').splice(1)
  }

  async command (ctx) {
    const args = this.parseArgs(ctx)
    if (args.length === 0) return ctx.reply(templates.render('search.noArgs'))
    const result = await this.search(args.join(' '))

    if (result.photo) ctx.replyWithPhoto(result.photo, { caption: result.text, parse_mode: 'Markdown' })
    else ctx.reply(result.text, { parse_mode: 'Markdown' })
  }

  async search (keyword) {
    let res
    try {
      res = await fetch(`${this.inventoryApi}/items/search/${encodeURI(keyword)}`)
    } catch (e) {
      return { text: templates.render('error') }
    }
    const { items } = await res.json()

    if (items.length === 0) return { text: templates.render('search.notFound') }
    const { location_id: locationId } = items[0]

    let image = `${this.inventoryApi}/location/${locationId}/photo`
    try {
      await fetch(image)
    } catch (e) {
      image = null
    }

    return { text: templates.render('search.result', items[0]), photo: image }
  }
}

module.exports = Search
