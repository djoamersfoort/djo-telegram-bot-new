import fetch from 'node-fetch'
import templates from '../templates.js'

interface Item {
  id: number
  name: string
  description: string
  location: string
  location_description: string
  location_id: number
  url: string
  properties: any[]
}
interface SearchResult {
  result: string
  items: Item[]
}

class Search {
  private readonly inventoryApi: string = 'https://inventory.djoamersfoort.nl/api/v1'

  constructor (public bot: Bot) {
    this.bot.command('search', this.command.bind(this))
  }

  parseArgs (ctx: Ctx) {
    return ctx.update.message.text.split(' ').splice(1)
  }

  async command (ctx: Ctx) {
    const args = this.parseArgs(ctx)
    if (args.length === 0) return ctx.reply(templates.render('search.noArgs'))
    const result = await this.search(args.join(' '))

    if (result.photo) ctx.replyWithPhoto(result.photo, { caption: result.text, parse_mode: 'Markdown' })
    else ctx.reply(result.text, { parse_mode: 'Markdown' })
  }

  async search (keyword: string) {
    let res
    try {
      res = await fetch(`${this.inventoryApi}/items/search/${encodeURI(keyword)}`)
    } catch (e) {
      return { text: templates.render('error') }
    }
    const { items } = await res.json() as SearchResult

    if (items.length === 0) return { text: templates.render('search.notFound') }
    const { location_id: locationId } = items[0]

    let image: string|null = `${this.inventoryApi}/location/${locationId}/photo`
    try {
      await fetch(image)
    } catch (e) {
      image = null
    }

    return { text: templates.render('search.result', items[0]), photo: image }
  }
}

export { Search }
