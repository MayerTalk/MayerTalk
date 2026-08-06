import { CHAT_DEFAULT } from './constance'

// 以 CHAT_DEFAULT 为唯一事实来源派生对话类型
export type ChatType = {
    [K in keyof typeof CHAT_DEFAULT]: typeof CHAT_DEFAULT[K]
}
