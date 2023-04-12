import { Telegraf } from 'telegraf'
import { Feed } from './modules/feed.js'
import { Aanmelden } from './modules/aanmelden.js'
import { Search } from './modules/search.js'
import templates from './modules/templateManager.js'
import { config } from './modules/config.js'

const bot = new Telegraf(config.token)
/* eslint-disable no-new */
new Feed(bot)
new Aanmelden(bot)
new Search(bot)
/* eslint-enable no-new */

bot.start(ctx => ctx.reply(config.texts.welcome))
bot.command('channel', ctx => ctx.reply('' + ctx.update.message.chat.id))
bot.command('help', ctx => ctx.reply(templates.render('help')))
bot.command('about', ctx => ctx.reply(templates.render('about'), { parse_mode: 'Markdown' }))
bot.command('time', ctx => {
  const current = new Date()
  ctx.reply(`Day: ${current.getDay()}, hour: ${current.getHours()}, minutes: ${current.getMinutes()}`)
})
bot.on('text', ctx => {
  Object.entries(config.triggers).forEach(([trigger, response]) => {
    if (!ctx.update.message.text.toLowerCase().includes(trigger)) return

    if (response.document) ctx.replyWithDocument(response.document)
    else ctx.reply(response.text, { parse_mode: 'Markdown' })
  })
})
bot.launch().then()
