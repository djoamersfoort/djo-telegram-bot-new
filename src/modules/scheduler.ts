import schedule from 'node-schedule'
import templates from './templateManager.js'

interface MsgEvent {
  channel: string|number,
  text: string
}

class Scheduler {
  constructor (public bot: Bot) {}

  schedule (
      time: string | number | schedule.RecurrenceRule | schedule.RecurrenceSpecDateRange | schedule.RecurrenceSpecObjLit | Date,
      job: MsgEvent | (() => void)
  ) {
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
