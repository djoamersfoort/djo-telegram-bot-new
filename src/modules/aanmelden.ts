import fetch from 'node-fetch'
import templates from './templateManager.js'
import { config } from '../config.js'
import { Scheduler } from './scheduler.js'

interface Day {
  name: string
  pod: string
  description: string
  enabled: boolean
  date: string
  taken: number
  available: number
  closed: boolean
  tutor_count: number
  announcement: string
}

class Aanmelden {
  constructor (public bot: Bot, public scheduler: Scheduler) {
    this.bot.command('aanmeld_status', ctx => {
      if (!config.allowedUsers.includes(ctx.update.message.chat.id)) {
        return ctx.reply(templates.render('notAllowed'))
      }

      this.announce(true).then()
    })
    this.scheduler.schedule(`${config.aanmelden.minutes} ${config.aanmelden.hour} * * ${config.aanmelden.day}`, this.announce.bind(this))
  }

  async announce (ignoreTime = false) {
    let res
    try {
      res = await fetch('https://aanmelden.djoamersfoort.nl/api/v2/free')
    } catch (e) {
      return
    }
    const days = await res.json() as Day[]
    const parsedDays = days.map(day => templates.render('day', day)).join('\n')

    await this.bot.telegram.sendMessage(config.channel, templates.render('aanmelden', { days: parsedDays }), { parse_mode: 'Markdown' })
  }
}

export { Aanmelden }
