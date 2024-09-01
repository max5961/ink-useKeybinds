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
 * fields.  Or maybe you want to enter a different mode temporarily for
 * something like 'press any key to continue'
 * */

export type Priority =
    | "never"
    | "default"
    | "override"
    | "overrideHigh"
    | "always";

type ProcessingGateContext = {
    canProcess(hookId: string, priority: Priority): boolean;
    updatePriority(hookId: string, priority: Priority): void;
    removeHook(hookId: string): void;
};

export const ProcessingGateContext =
    createContext<ProcessingGateContext | null>(null);

let i = 0;
export default function KeybindProcessingGate({
    children,
}: PropsWithChildren): React.ReactNode {
    // console.log(`Processing gate: ${++i}`);
    const [gate, setGate] = useState<{ [key: string]: Priority }>({});

    function canProcess(hookId: string, priority: Priority): boolean {
        /*
         * 'always' and 'never' don't interfere with other priority levels.
         * */
        if (priority === "always") {
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
            overrideHigh: 2,
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
