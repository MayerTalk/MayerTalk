import { ImageStorage, Storage } from './data';
import { GenericSettings } from '@/lib/data/settings';

export interface CharsRecord {
    name: string,
    avatar: string
}

export interface CharsData {
    [id: string]: CharsRecord
}

export interface ChatsRecord {
    char: string,
    content: string
    data: {
        cutPoint?: boolean
    },
    id: string,
    type: string,
}

export type ChatsData = ChatsRecord[]

export interface ConfigData {
    editor: string,
    lang: string
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
