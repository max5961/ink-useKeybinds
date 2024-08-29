/* If one or more hooks sets override to true, config processing will be blocked
 * for all hook instances that don't have override set to true */
const OVERRIDE = new Set<string>();

function update(hookId: string, override: boolean): void {
    setImmediate(() => {
        if (override) {
            OVERRIDE.add(hookId);
        } else {
            OVERRIDE.delete(hookId);
        }
    });
}

function canProcess(hookId: string): boolean {
    // console.log(OVERRIDE);
    return !OVERRIDE.size || OVERRIDE.has(hookId);
}

function debug(): void {
    console.log(OVERRIDE);
}

export default {
    update,
    debug,
    canProcess,
};
