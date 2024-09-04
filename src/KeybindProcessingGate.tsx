import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useState,
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

const reducer = (state: Gate, action: Action) => {
    const copy = { ...state };
    if (action.type === "UPDATE_PRIORITY") {
        copy[action.payload.hookID] = action.payload.priority;
        return copy;
    }

    return state;
};

export default function KeybindProcessingGate({
    children,
}: PropsWithChildren): React.ReactNode {
    const [gate, setGate] = useState<{ [key: string]: Priority }>({});

    function canProcess(hookId: string, priority: Priority): boolean {
        /*
         * 'always' and 'never' don't interfere with other priority levels, but
         * 'textinput' overrides everything including 'always'
         * */
        if (priority === "always") {
            /* textinput overrides always */
            for (const key in gate) {
                if (gate[key] === "textinput") {
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
            if (gate[key] === "always") continue;
            if (gate[key] === "never") continue;

            if (map[gate[key]] > map[priority]) {
                return false;
            }
        }

        return true;
    }

    function updatePriority(hookId: string, priority: Priority): void {
        const gateCopy = { ...gate };
        gateCopy[hookId] = priority;
        setGate(gateCopy);
    }

    function removeHook(hookId: string): void {
        const gateCopy = { ...gate };
        delete gateCopy[hookId];
        setGate(gateCopy);
    }

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
    type: "UPDATE_PRIORITY" | "CAN_PROCESS" | "REMOVE_HOOK";
    payload: { hookID: string; priority: Priority };
};
type Gate = { [HOOK_ID: string]: Priority };
