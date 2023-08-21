import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { Feed } from './modules/feed.js'
import { Aanmelden } from './modules/aanmelden.js'
import { Search } from './modules/search.js'
import { Scheduler } from './modules/scheduler.js'
import { ICal } from './modules/ical.js'
import templates from './modules/templateManager.js'
import { config } from './config.js'

const bot = new Telegraf(config.token)
/* eslint-disable no-new */
const scheduler = new Scheduler(bot)
new Feed(bot)
new Aanmelden(bot, scheduler)
new Search(bot)
if (config.calendar) new ICal(bot, scheduler)
/* eslint-enable no-new */

bot.start(ctx => ctx.reply(templates.render('welcome')))
bot.command('channel', ctx => ctx.reply(ctx.update.message.chat.id.toString()))
bot.command('help', ctx => ctx.reply(templates.render('help')))
bot.command('about', ctx => ctx.reply(templates.render('about'), { parse_mode: 'Markdown' }))
bot.command('time', ctx => {
  const current = new Date()
  ctx.reply(`Day: ${current.getDay()}, hour: ${current.getHours()}, minutes: ${current.getMinutes()}`)
})
bot.on(message('text'), ctx => {
  Object.entries(config.triggers).forEach(([trigger, response]) => {
    if (!ctx.update.message.text.toLowerCase().includes(trigger)) return

    if (response.document) ctx.replyWithDocument(response.document)
    if (response.text) ctx.reply(response.text, { parse_mode: 'Markdown' })
  })
})
bot.launch().then()
