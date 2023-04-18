import { config } from './config.js'

class TemplateManager {
  constructor () {
    this.texts = this.parseObject(config.texts)
  }

  parseObject (object) {
    const result = {}
    Object.entries(object).forEach(([key, value]) => {
      if (value instanceof Object) {
        Object.entries(this.parseObject(value)).forEach(([key2, value2]) => {
          result[`${key}.${key2}`] = value2
        })
        return
      }
      result[key] = value
    })

    return result
  }

  render (id, params = {}) {
    return this.renderText(this.texts[id], params)
  }

  renderText (text, params = {}) {
    return text.replaceAll(/%(.*?)%/gm, (_string, placeholder) => {
      return params[placeholder]
    })
  }
}

export default new TemplateManager()
