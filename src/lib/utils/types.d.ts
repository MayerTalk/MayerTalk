export interface Callback {
    (): void
}

export type OptionalCallback = Callback | undefined

export interface CallBackWithData<T> {
    (data: T): void
}

