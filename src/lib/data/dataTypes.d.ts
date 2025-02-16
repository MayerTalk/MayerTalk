import { ImageStorage, Storage } from './data';

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
    data: object,
    id: string,
    type: string
}

export type ChatsData = ChatsRecord[]

export interface ConfigData {
    editor: string,
    lang: string
    renderer: string
}

export interface SettingsData {
    common: object,
    editor: { [editor: string]: object },
    renderer: { [renderer: string]: object }
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

export type StorageDataType = {
    [key in StorageKey]: object
}

export interface OperateRecord {
    key: StorageKey,
    old: string,
    new: string
    type: string
}
