import schedule from 'node-schedule'
import { config } from './config.js'
import templates from './templateManager.js'

class Scheduler {
  constructor (bot) {
    this.bot = bot
    this.standardJobs()
  }

  standardJobs () {
    config.scheduled?.forEach(e => {
      this.schedule(e.time, e)
    })
  }

  schedule (time, job) {
    schedule.scheduleJob(time, async () => {
      if (job instanceof Function) {
        job()
      } else {
        await this.bot.telegram.sendMessage(job.channel, templates.renderText(job.text), { parse_mode: 'Markdown' })
      }
    })
  }
}

export { Scheduler }
