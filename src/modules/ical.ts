import { config } from '../config.js'
import ical from 'node-ical'
import { NodeHtmlMarkdown } from 'node-html-markdown'
import templates from './templateManager.js'
import { Scheduler } from './scheduler.js'
import { Job } from 'node-schedule'

interface JobRegister {
  job: Job
  event: ical.VEvent
}

class ICal {
  private jobs: Map<string, JobRegister>

  constructor (public bot: Bot, public scheduler: Scheduler) {
    this.jobs = new Map()
    this.getEvents().then()
    this.bot.command('list_scheduled', ctx => {
      if (!config.allowedUsers.includes(ctx.update.message.chat.id)) {
        return ctx.reply(templates.render('notAllowed'))
      }

      const msg = [...this.jobs.values()]
        .map(e => `${e.event.summary} - ${e.job.nextInvocation().toString()}`)
        .join('\n')
      ctx.reply(`Scheduled runs: \n${msg || 'No jobs scheduled'}`)
    })
    setInterval(this.getEvents.bind(this), 5 * 60 * 1000)
  }

  async scheduleJob (event: ical.VEvent) {
    if (event.rrule && !event.rrule.after(new Date())) return
    if (!event.rrule && event.start.getTime() < Date.now()) return

    const job = this.scheduler.schedule(event.rrule ? event.rrule.after(new Date()) : event.start, async () => {
      await this.bot.telegram.sendMessage(
        parseInt(event.location) || event.location || config.channel,
        NodeHtmlMarkdown.translate(event.description),
        { parse_mode: 'Markdown' }
      )
      await this.scheduleJob(event)
    })
    this.jobs.set(event.uid, {
      job,
      event
    })
  }

  async getEvents () {
    const events = await ical.fromURL(config.calendar)

    this.jobs.forEach(({ job, event: oldEvent }, id) => {
      const event = events[id]
      if (!job) return this.jobs.delete(id)
      if (event?.type !== 'VEVENT') {
        this.jobs.delete(id)
        return job.cancel()
      }
      delete events[id]

      if (
        event.description === oldEvent.description &&
        event.location === oldEvent.location &&
        event.start.getTime() === oldEvent.start.getTime()
      ) return
      job.cancel()
      this.scheduleJob(event).then()
    })
    for (const event of Object.values(events)) {
      if (event.type !== 'VEVENT') continue

      this.scheduleJob(event).then()
    }
  }
}

export { ICal }
