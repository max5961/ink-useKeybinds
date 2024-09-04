import React, {
    createContext,
    PropsWithChildren,
    useCallback,
    useContext,
    useReducer,
    useRef,
} from "react";
import assert from "assert";

/*
 * Sets priority levels for useKeybinds hooks so that control can be passed
 * between different hook instances.  This allows you to keep a global keybind
 * configuration while not interrupting operations such as filling out form
 * fields. Or maybe you want to temporarily override your normal settings to fill
 * out a form such as press any key to continue
 * */

export type Priority =
    | "never"
    | "default"
    | "override"
    | "always"
    | "textinput";

type ProcessingGateContext = {
    canProcess(hookId: string, priority: Priority): boolean;
    updatePriority(hookId: string, priority: Priority): void;
    removeHook(hookId: string): void;
};

export const ProcessingGateContext =
    createContext<ProcessingGateContext | null>(null);

const reducer = (gate: Gate, action: Action) => {
    const copy = { ...gate };
    if (action.type === "UPDATE_PRIORITY") {
        if (action.payload.priority) {
            copy[action.payload.hookId] = action.payload.priority;
        }
        return copy;
    }

    if (action.type === "REMOVE_HOOK") {
        delete copy[action.payload.hookId];
        return copy;
    }

    throw new Error("Unhandled action type");
};

export default function KeybindProcessingGate({
    children,
}: PropsWithChildren): React.ReactNode {
    const [gate, dispatch] = useReducer(reducer, {});
    // const [gate, setGate] = useState<{ [key: string]: Priority }>({});
    const gateRef = useRef<Gate>(gate);
    gateRef.current = gate;

    const canProcess = useCallback(
        (hookId: string, priority: Priority): boolean => {
            /*
             * 'always' and 'never' don't interfere with other priority levels, but
             * 'textinput' overrides everything including 'always'
             * */
            if (priority === "always") {
                /* textinput overrides always */
                for (const key in gateRef.current) {
                    if (gateRef.current[key] === "textinput") {
                        return false;
                    }
                }

                return true;
            }

            if (priority === "never") {
                return false;
            }

            /*
             * Other priority levels can override each other
             * */
            const map: Record<Exclude<Priority, "never" | "always">, number> = {
                default: 0,
                override: 1,
                textinput: 2,
            } as const;

            for (const key in gate) {
                if (key === hookId) continue;
                if (gateRef.current[key] === "always") continue;
                if (gateRef.current[key] === "never") continue;

                if (map[gateRef.current[key]] > map[priority]) {
                    return false;
                }
            }

            return true;
        },
        [],
    );

    const updatePriority = useCallback((hookId: string, priority: Priority) => {
        dispatch({ type: "UPDATE_PRIORITY", payload: { hookId, priority } });
    }, []);

    const removeHook = useCallback((hookId: string) => {
        dispatch({ type: "REMOVE_HOOK", payload: { hookId } });
    }, []);

    return (
        <ProcessingGateContext.Provider
            value={{
                canProcess,
                updatePriority,
                removeHook,
            }}
        >
            {children}
        </ProcessingGateContext.Provider>
    );
}

export function useKeybindPriority(): Exclude<ProcessingGateContext, null> {
    const priorityContext = useContext(ProcessingGateContext);
    assert(priorityContext, "Must use within KeybindProcessingGate component");

    return priorityContext;
}

type Action = {
    type: "UPDATE_PRIORITY" | "REMOVE_HOOK";
    payload: { hookId: string; priority?: Priority };
};
type Gate = { [HOOK_ID: string]: Priority };
