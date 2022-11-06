const Parser = require('rss-parser')
const fs = require('fs')
const config = require('../data/config.json')
const templates = require('./templateManager')

class Feed {
    constructor(bot) {
        this.bot = bot
        this.parser = new Parser()
        this.parsed = fs.existsSync('./data/guids.json') ? JSON.parse(fs.readFileSync('./data/guids.json').toString()) : []

		this.parse().then()
		setInterval(this.parse, 5 * 60 * 1000)
    }

	async message(item) {
        await this.bot.telegram.sendMessage(config.channel, templates.render('post', item), { parse_mode: "Markdown" })
    }

	async parse() {
        let res
        try {
            res = await this.parser.parseURL('https://djoamersfoort.nl/feed')
        } catch (e) {
            return
        }
		const { items } = res

		items.forEach(item => {
            if (this.parsed.includes(item.guid)) return
			this.message(item)
			this.parsed.push(item.guid)
		})
		fs.writeFileSync('./data/guids.json', JSON.stringify(this.parsed))
    }
}

module.exports = Feed