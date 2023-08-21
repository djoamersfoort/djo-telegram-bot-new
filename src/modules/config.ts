import fs from 'fs'

interface Response {
  text?: string
  document?: string
}
export interface Texts {
  [cmd: string]: string|Texts
}
interface Config {
  token: string
  allowedUsers: number[]
  channel: number
  texts: Texts
  aanmelden: {
    day: number
    hour: number
    minutes: number
  }
  triggers: Record<string, Response>
  calendar: string
}

if (!fs.existsSync('./data/config.json')) {
  console.error('No config provided')
  process.exit(1)
}
export const config = JSON.parse(fs.readFileSync('./data/config.json').toString()) as Config
