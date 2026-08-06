import type { ChatType } from './dialogue';
import { GenericSettings } from '@/lib/data/settings';
import { ImageStorage, Storage } from '@/lib/data/data';
import type { SupportLangKey } from '@/lib/lang/constant';

export type { ChatType };

export interface CharsRecord {
    name: string,
    avatar: string,
    right?: boolean
}

export interface CharsData {
    [id: string]: CharsRecord
}

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
    generic: GenericSettings,
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

export interface OperationRecord {
    key: StorageKey,
    old: string,
    new: string
    type: string
}
