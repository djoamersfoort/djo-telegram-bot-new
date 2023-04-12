import fetch from 'node-fetch'
import templates from './templateManager.js'
import { config } from './config.js'

class Aanmelden {
  constructor (bot) {
    this.bot = bot

    this.bot.command('aanmeld_status', ctx => {
      if (!config.allowedUsers.includes(ctx.update.message.chat.id)) { return ctx.reply(templates.render('notAllowed')) }

      this.announce(true).then()
    })
    setInterval(() => this.announce(), 60 * 1000)
  }

  isNow () {
    const current = new Date()

    if (current.getDay() !== config.aanmelden.day) return false
    if (current.getHours() !== config.aanmelden.hour) return false
    if (current.getMinutes() !== config.aanmelden.minutes) return false

    return true
  }

  async announce (ignoreTime = false) {
    if (!ignoreTime && !this.isNow()) return
    let res
    try {
      res = await fetch('https://aanmelden.djoamersfoort.nl/api/v2/free')
    } catch (e) {
      return
    }
    const days = await res.json()
    const parsedDays = days.map(day => templates.render('day', day)).join('\n')

    await this.bot.telegram.sendMessage(config.channel, templates.render('aanmelden', { days: parsedDays }), { parse_mode: 'Markdown' })
  }
}

export { Aanmelden }
