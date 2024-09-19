import { KeyBinds } from "../../../use-keybinds/useKeybinds.js";
import { createContext, useContext } from "react";

export type ItemContext<
    KeyBindsType extends KeyBinds = any,
    ItemsType extends any[] = any,
> = {
    items: ItemsType;
    isFocus: boolean;
    index: number;
};

export const ItemContext = createContext<ItemContext | null>(null);

export function useItem<
    KeyBindsType extends KeyBinds = any,
    ItemsType extends any[] = any,
>(): ItemContext<KeyBindsType, ItemsType> {
    const context = useContext(ItemContext);

    if (!context) {
        throw new Error(
            "Attempting to use useItem hook outside of the context of a List component",
        );
    }

    return context;
}

// if (type === "ITEMS") {
//     return (
//         <ItemContext.Provider
//             value={{
//                 isFocus,
//                 index,
//                 items,
//             }}
//         >
//             {getUnits()}
//         </ItemContext.Provider>
//     );
// }

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
