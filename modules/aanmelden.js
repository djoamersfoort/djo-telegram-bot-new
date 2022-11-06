const config = require('../data/config.json')
const fetch = require('node-fetch')
const templates = require('./templateManager')

class Aanmelden {
    constructor(bot) {
        this.bot = bot

		this.bot.command('aanmeld_status', ctx => {
            if (!config.allowedUsers.includes(ctx.update.message.chat.id))
                return ctx.reply(templates.render('notAllowed'))

			this.announce().then()
        })
        setTimeout(this.announce, this.timeLeft())
    }

	isToday() {
        const current = new Date()

		if (current.getDay() !== config.aanmelden.day) return false
		if (current.getHours() > config.aanmelden.hour) return false
		if (current.getHours() < config.aanmelden.hour) return true
		if (current.getMinutes() > config.aanmelden.minutes) return false

		return true
    }
	nextWeek() {
        const date = new Date()
		date.setDate(date.getDate() + ((7 - date.getDay() + config.aanmelden.day) % 7 || 7))

		return date
    }
	timeLeft() {
        const current = new Date()

		const date = this.isToday() ? current : this.nextWeek()
		date.setHours(config.aanmelden.hour)
		date.setMinutes(config.aanmelden.minutes)

		return date.getTime() - current.getTime()
    }

	async announce() {
        setTimeout(this.announce, 7 * 24 * 60 * 60 * 1000)

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

module.exports = Aanmelden