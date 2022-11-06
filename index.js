const { Telegraf } = require('telegraf')
const config = require('./data/config.json')
const Feed = require('./modules/feed')
const Aanmelden = require('./modules/aanmelden')
const Search = require('./modules/search')
const templates = require('./modules/templateManager')

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
bot.on('text', ctx => {
  Object.entries(config.triggers).forEach(([trigger, response]) => {
    if (!ctx.update.message.text.toLowerCase().includes(trigger)) return

    if (response.document) ctx.replyWithDocument(response.document)
    else ctx.reply(response.text, { parse_mode: 'Markdown' })
  })
})
bot.launch().then()
