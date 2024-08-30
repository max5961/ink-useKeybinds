import assert from "assert";

/* If one or more hooks sets override to true, config processing will be blocked
 * for all hook instances that don't have override set to true */
const OVERRIDE: { [key: string]: number } = {};

function update(hookId: string, priority: number): void {
    OVERRIDE[hookId] = priority;
    // console.log(`UPDATING: ${hookId} : ${priority}`);
}

function canProcess(hookId: string, priority: number): boolean {
    const max = Object.values(OVERRIDE).reduce((a, c) => {
        return Math.max(a, c);
    }, -Infinity);

    return priority >= max;
}

function remove(hookId: string): void {
    delete OVERRIDE[hookId];
}

function debug(): void {
    console.log(OVERRIDE);
}

export default {
    update,
    debug,
    canProcess,
    remove,
};
