import assert from "assert";

/*
 * Sets priority levels for useKeybinds hooks so that control can be passed
 * between different hook instances.  This allows you to keep separate keybind
 * configurations while not interrupting operations such as filling out form
 * fields. Or maybe you want to temporarily override your normal settings to
 * allow something such as press any key to continue
 *
 * 'always' and 'never' do not interfere with other priority levels
 * 'override' overrides anything set to 'default'
 * 'textinput' overrides everything including 'always'
 * */

export type Priority =
    | "never"
    | "always"
    | "default"
    | "override"
    | "textinput";

type Gate = { [HOOK_ID: string]: Priority };

const gate: Gate = {};

function canProcess(hookId: string, priority?: Priority): boolean {
    if (!priority) {
        priority = gate[hookId];
        assert(priority);
    }

    if (priority === "always") {
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
    gate[hookId] = priority;
}

function removeHook(hookId: string): void {
    delete gate[hookId];
}

export default {
    canProcess,
    updatePriority,
    removeHook,
};
