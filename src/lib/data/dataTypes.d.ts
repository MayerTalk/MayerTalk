import { ImageStorage, Storage } from './data';
import { GenericSettings } from '@/lib/data/settings';
import { ChatType } from '@/lib/data/constance.ts';
import type { SupportLangKey } from '../lang/constant';

export interface CharsRecord {
    name: string,
    avatar: string,
    right?: boolean
}

export interface CharsData {
    [id: string]: CharsRecord
}

export interface ChatType {
    chat: string
    monologue: string
    image: string
    option: Array<[string, string]> // uuid() 返回字符串
    select: string
    title: string
}

/*
TODO: 优化ChatsRecord类型定义，新建dialogue.ts文件，从常量定义中自动生成类型定义
*/

export type ChatsRecord = {
    [T in keyof ChatType]: {
        char: string
        content: ChatType[T]
        data: {
            cutPoint?: boolean
        }
        id: string
        type: T
    }
}[keyof ChatType] 

export type ChatsData = ChatsRecord[]

export interface ConfigData {
    editor: string,
    lang: SupportLangKey
    renderer: string
}

export interface SettingsData {
    common: GenericSettings,
    editor: Record<string, object>
    renderer: Record<string, object>
}

export interface ImagesRecord {
    id: string,
    count: number,
    src: string
}

export interface ImagesData {
    [id: string]: {
        count: number,
        src: string
    }
}

export interface DataType {
    chars: CharsData
    chats: ChatsData
    config: ConfigData
    settings: SettingsData
    images: ImagesData,
    version: string
}

export type StorageKey = 'config' | 'settings' | 'chars' | 'chats' | 'images'

export interface StorageType {
    config: Storage<ConfigData>
    settings: Storage<SettingsData>
    chars: Storage<CharsData>
    chats: Storage<ChatsData>
    images: ImageStorage,
    version?: string
}

export interface OperateRecord {
    key: StorageKey,
    old: string,
    new: string
    type: string
}
