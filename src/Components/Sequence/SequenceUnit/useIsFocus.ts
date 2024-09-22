import { useItemFocus } from "./ItemContext.js";
import { usePageFocus } from "./PageContext.js";

export function useIsFocus(): boolean {
    const itemFocus = useItemFocus();
    const pageFocus = usePageFocus();
    return itemFocus && pageFocus;
}
