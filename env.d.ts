/// <reference types="vite/client" />

interface DevInfo {
    expire: number
    expireString: string
    build: number
    message: string
    version: string
    tag: string
}

declare const __MAYERTALK_DEV_INFO__: DevInfo | null
