import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useRef,
    useState,
} from "react";
import EventEmitter from "events";
import { TextInput } from "../Input/TextInput.js";
import { Box } from "ink";

type Props<T = any> = PropsWithChildren & { onSubmit?: (data: T) => unknown };
type FormValues = { [name: string]: string };
type FormContext = {
    values: FormValues;
    FORM_EMITTER: EventEmitter;
};
const FormContext = createContext<FormContext | null>(null);
export function useFormContext(): FormContext | null {
    const context = useContext(FormContext);
    return context;
}

export function Form({ children, onSubmit }: Props): React.ReactNode {
    React.Children.map(children, (child: React.ReactNode) => {
        if (React.isValidElement(child)) {
            if (child.type === TextInput) {
                // return WrappedTextInput
                return null;
            } else {
                return child;
            }
        } else {
            return null;
        }
    });

    function DFS(children: React.ReactNode, targetType: Function): void {
        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child) && child.type === targetType) {
                //
            } else if (
                React.isValidElement(child) &&
                (child as any).props.children
            ) {
                DFS((child as any).props.children, targetType);
            }
        });
    }

    const [FORM_EMITTER] = useState(new EventEmitter());
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
            }}
        >
            <Box display="flex" flexDirection="column" width="100">
                {children}
            </Box>
        </FormContext.Provider>
    );
}
