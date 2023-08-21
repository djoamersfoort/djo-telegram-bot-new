import { config, Texts } from './config.js'

class TemplateManager {
  render (id: string, params = {}) {
    const path = id.split('.')
    const template = path.reduce((o: Texts|string, i) => (o as Texts)[i], config.texts)

    return this.renderText(template as string, params)
  }

  renderText (text: string, params: Record<string, string> = {}) {
    return text.replaceAll(/%(.*?)%/gm, (_string, placeholder) => {
      return params[placeholder]
    })
  }
}

export default new TemplateManager()
