import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useRef,
    useState,
} from "react";
import { useList } from "../List/useList.js";
import { List } from "../List/List.js";
import { Box } from "ink";
import { useKeybinds } from "../../use-keybinds/useKeybinds.js";
import { useEvent } from "../../use-keybinds/useEvent.js";
import EventEmitter from "events";

type Props<T = any> = PropsWithChildren & { onSubmit?: (data: T) => unknown };
type FormValues = { [name: string]: string };
type FormContext = {
    values: FormValues;
    FORM_EMITTER: EventEmitter;
    nextItem: () => void;
    prevItem: () => void;
};
const FormContext = createContext<FormContext | null>(null);
export function useFormContext(): FormContext | null {
    const context = useContext(FormContext);
    return context;
}

export function Form({ children, onSubmit }: Props): React.ReactNode {
    const [FORM_EMITTER] = useState(new EventEmitter());

    const childNodes = React.Children.map(children, (child, idx) => {
        return <Box key={idx}>{child}</Box>;
    });

    if (!childNodes) throw new Error("Form needs some children");

    const { listState, listUtil } = useList(childNodes, {
        circular: true,
        navigation: "none",
    });

    useKeybinds({
        nextFormItem: [{ key: "down" }, { key: "tab" }],
        prevFormItem: { key: "up" },
    });

    useEvent("nextFormItem", () => {
        listUtil.nextItem();
    });

    useEvent("prevFormItem", () => {
        listUtil.prevItem();
    });

    const formValues = useRef<FormValues>({});

    const unsubscribe = useRef<() => void>(() => {});
    unsubscribe.current();
    unsubscribe.current = (() => {
        const handler = () => {
            onSubmit && onSubmit(formValues.current);
        };
        FORM_EMITTER.on("SUBMIT", handler);
        return () => FORM_EMITTER.off("SUBMIT", handler);
    })();

    return (
        <FormContext.Provider
            value={{
                values: formValues.current,
                FORM_EMITTER,
                nextItem: listUtil.nextItem,
                prevItem: listUtil.prevItem,
            }}
        >
            <List items={childNodes} listState={listState} />
        </FormContext.Provider>
    );
}
