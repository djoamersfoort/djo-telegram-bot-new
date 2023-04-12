import fs from 'fs'

if (!fs.existsSync('./data/config.json')) {
  console.error('No config provided')
  process.exit(1)
}
export const config = JSON.parse(fs.readFileSync('./data/config.json').toString())
