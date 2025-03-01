export interface CollapseItem extends HTMLElement {
    dataset: {
        oldOverflow?: string,
        oldPaddingTop?: string,
        oldPaddingLeft?: string,
        oldPaddingBottom?: string
        oldPaddingRight?: string
    }
}
