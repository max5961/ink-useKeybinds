import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useRef,
    useState,
} from "react";
import EventEmitter from "events";
import { Box } from "ink";
import { NavigatorPublicMethods } from "../Navigation/Navigator.js";

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
