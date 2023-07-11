import schedule from 'node-schedule'
import templates from './templateManager.js'

class Scheduler {
  constructor (bot) {
    this.bot = bot
  }

  schedule (time, job) {
    return schedule.scheduleJob(time, async () => {
      if (job instanceof Function) {
        job()
      } else {
        await this.bot.telegram.sendMessage(job.channel, templates.renderText(job.text), { parse_mode: 'Markdown' })
      }
    })
  }
}

export { Scheduler }
