import { KeyBinds } from "../../../use-keybinds/useKeybinds.js";
import { createContext, useContext } from "react";

export type ItemContext<ItemsType extends any[] = any> = {
    items: ItemsType;
    isFocus: boolean;
    index: number;
};

export const ItemContext = createContext<ItemContext | null>(null);

export function useItem<
    ItemsType extends any[] = any,
>(): ItemContext<ItemsType> & { item: ItemsType[number] } {
    const context = useContext(ItemContext);

    if (!context) {
        throw new Error(
            "Attempting to use useItem hook outside of the context of a List component",
        );
    }

    const items = context.items;
    const index = context.index;
    const isFocus = context.isFocus;
    const item = items[index];

    return { items, index, isFocus, item };
}

/*
 * When creating event listeners, we can safely assume that if there is no item
 * context then the Node exists outside of an Item component and there is no need
 * to block the execution of the node based on its focus status
 * */
export function useItemFocus(): boolean {
    const itemContext = useContext(ItemContext);
    if (itemContext === null) return true;
    return itemContext.isFocus;
}
