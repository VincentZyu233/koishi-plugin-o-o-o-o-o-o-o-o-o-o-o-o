import { Context, Schema, h } from 'koishi'
import {} from '@koishijs/plugin-notifier'

export const name = 'o-o-o-o-o-o-o-o-o-o-o-o'

export const inject = {
  optional: ['notifier'],
}

export const reusable = true

export const filter = false
export const usage = `---

开启插件看看？

---`

export interface Config {
  modifySendText: boolean
  separator: string
  showNotifier: boolean
  notifierDuration: number
}

export const Config: Schema<Config> = Schema.object({
  modifySendText: Schema.boolean()
    .description('是否修改机器人发送的文本，在文本元素的每个字符之间插入配置的字符串。')
    .default(true),
  separator: Schema.string()
    .description('修改发送文本时，在每个字符之间插入的字符串。')
    .default('-'),
  showNotifier: Schema.boolean()
    .description('是否使用 notifier 在控制台显示启动文本。')
    .default(true),
  notifierDuration: Schema.number()
    .role('time')
    .description('notifier 显示时长，单位为毫秒；小于等于 0 表示不自动消失。')
    .default(700),
})

function insertSeparatorBetweenChars(elements: h[], separator: string) {
  for (const el of elements) {
    if (el.type === 'text' && el.attrs?.content != null) {
      el.attrs.content = Array.from(String(el.attrs.content)).join(separator)
    }

    if (el.children?.length) {
      insertSeparatorBetweenChars(el.children, separator)
    }
  }
}

function buildContent(): h[] {
  return [
    h('div', {
      style: [
        'text-align: center',
        'padding: 16px 24px',
        'background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'border: 3px solid #e94560',
        'border-radius: 8px',
        'box-shadow: 0 0 20px #e94560, 0 0 40px #e9456066',
        'font-family: "Impact", "Arial Black", sans-serif',
      ].join('; '),
    },
      h('div', {
        style: [
          'font-size: 64px',
          'font-weight: 900',
          'color: #fff',
          'text-shadow: -3px -3px 0 #e94560, 3px -3px 0 #e94560, -3px 3px 0 #e94560, 3px 3px 0 #e94560, 0 0 20px #ff6b6b',
          'transform: rotate(-5deg) skewX(-8deg)',
          'display: inline-block',
          'letter-spacing: 8px',
          'line-height: 1',
          'margin-bottom: 8px',
        ].join('; '),
      }, `唔嗯哦哦❤？！呜齁噗吼、呜咿噗噫喔噢噢噢噢噢噢噢噢————❤！！！
唔……❤嗯啊……❤呜咕呼……❤唔噗……❤喔……❤呜咕❤”
嗯喔啊……❤唔噢噢……
呜咕唔咿哦、噗喔哦噢噢噢噢——❤！！
嗯啾……唔噗滋……噗噜……啾……唔嗯噗噜噜噜噜噜~~~❤`),

    ),
  ]
}

export async function apply(ctx: Context, config: Config) {
  const modifySendText = config.modifySendText ?? true
  const separator = config.separator ?? '-'
  const showNotifier = config.showNotifier ?? true
  const notifierDuration = config.notifierDuration ?? 700

  if (modifySendText) {
    ctx.on('before-send', (session) => {
      if (session.elements?.length) {
        insertSeparatorBetweenChars(session.elements, separator)
      }
    })
  }

  if (!showNotifier || !ctx.notifier) return

  const notifier = ctx.notifier.create(buildContent())
  let disposed = false
  const disposeNotifier = () => {
    if (disposed) return
    disposed = true
    notifier.dispose()
  }
  ctx.on('dispose', disposeNotifier)

  if (notifierDuration <= 0) return

  try {
    await ctx.sleep(notifierDuration)
  } catch {
    return
  }

  disposeNotifier()
}
