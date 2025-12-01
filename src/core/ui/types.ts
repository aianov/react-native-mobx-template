export interface InputUiValues {
	value?: string
	setValue?: (name: string, value: string) => void
}
export type TextAlignT = "auto" | "left" | "right" | "center" | "justify"