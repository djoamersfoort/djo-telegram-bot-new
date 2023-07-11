import { config } from './config.js'
import ical from 'node-ical'
import htmlToMarkdown from '@wcj/html-to-markdown'

class ICal {
  constructor (bot, scheduler) {
    this.bot = bot
    this.scheduler = scheduler
    this.jobs = new Map()
    this.getEvents().then()
    setInterval(this.getEvents.bind(this), 5 * 60 * 1000)
  }

  async scheduleJob (event) {
    if (event.rrule && !event.rrule.after(new Date())) return
    if (!event.rrule && event.start.getTime() < Date.now()) return

    const job = this.scheduler.schedule(event.rrule ? event.rrule.after(new Date()) : event.start, {
      channel: parseInt(event.location) || event.location || config.channel,
      text: await htmlToMarkdown({ html: event.description })
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
