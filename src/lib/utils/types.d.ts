export interface Callback {
    (): void
}

export type OptionalCallback = Callback | undefined

export interface CallBackData<T> {
    (data: T): void
}

