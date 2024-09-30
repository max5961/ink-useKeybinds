import { describe, expect, test } from "vitest";
import { Navigator, Initializer } from "./Navigator.js";
import { equalInitializers } from "./util.js";

// prettier-ignore
const map: Initializer = [
    ["a", "b"],
    ["c"],
    ["d"],
    ["e"],
    ["f", "g"],
    ["h"],
];

describe("Starting node in constructor", () => {
    test("a", () => {
        const nav = new Navigator(map, "a");
        expect(nav.getLocation()).toBe("a");
    });
    test("b", () => {
        const nav = new Navigator(map, "b");
        expect(nav.getLocation()).toBe("b");
    });
    test("c", () => {
        const nav = new Navigator(map, "c");
        expect(nav.getLocation()).toBe("c");
    });

    test("iteration 0", () => {
        const nav = new Navigator(map, 0);
        expect(nav.getLocation()).toBe("a");
    });
    test("iteration 1", () => {
        const nav = new Navigator(map, 1);
        expect(nav.getLocation()).toBe("b");
    });
    test("iteration 2", () => {
        const nav = new Navigator(map, 2);
        expect(nav.getLocation()).toBe("c");
    });

    test("invalid starting node defaults safely", () => {
        const nav = new Navigator(map, "z");
        expect(nav.getLocation()).toBe("a");
    });
});

describe("Handles different initializers", () => {
    test("Empty initializer '[[]]' does not throw error", () => {
        const map = [[]];
        expect(() => {
            new Navigator(map);
        }).not.toThrow();
    });

    test("Empty initializer '[]' does not throw error", () => {
        const map = [[]];
        expect(() => {
            new Navigator(map);
        }).not.toThrow();
    });

    test("Empty initializer '[[]]' always returns ''", () => {
        const map = [[]];
        const nav = new Navigator(map);

        expect(nav.getLocation()).toBe("");
        expect(nav.next()).toBe("");
        expect(nav.prev()).toBe("");
        expect(nav.moveToIteration(0)).toBe("");
        expect(nav.left()).toBe("");
        expect(nav.right()).toBe("");
        expect(nav.down()).toBe("");
        expect(nav.up()).toBe("");
    });

    test("Empty initializer '[]' always returns ''", () => {
        const map = [];
        const nav = new Navigator(map);

        expect(nav.getLocation()).toBe("");
        expect(nav.next()).toBe("");
        expect(nav.prev()).toBe("");
        expect(nav.moveToIteration(0)).toBe("");
        expect(nav.left()).toBe("");
        expect(nav.right()).toBe("");
        expect(nav.down()).toBe("");
        expect(nav.up()).toBe("");
    });

    test("Single node does not throw error", () => {
        const map = [["a"]];
        expect(() => {
            new Navigator(map);
        }).not.toThrow();

        const nav = new Navigator(map);
        expect(nav.getLocation()).toBe("a");
        expect(nav.up()).toBe("a");
        expect(nav.down()).toBe("a");
        expect(nav.left()).toBe("a");
        expect(nav.right()).toBe("a");
        expect(nav.next()).toBe("a");
        expect(nav.prev()).toBe("a");
    });
});

describe("moveToIteration()", () => {
    const map = [
        ["0", "1"],
        ["2", "3"],
    ];
    const nav = new Navigator(map);

    test("Out of range", () => {
        expect(nav.moveToIteration(4)).toBe("0");
        expect(nav.moveToIteration(5)).toBe("0");
        expect(nav.moveToIteration(6)).toBe("0");
        expect(nav.moveToIteration(7)).toBe("0");
    });

    test("In range", () => {
        expect(nav.moveToIteration(0)).toBe("0");
        expect(nav.moveToIteration(1)).toBe("1");
        expect(nav.moveToIteration(2)).toBe("2");
        expect(nav.moveToIteration(3)).toBe("3");
        expect(nav.moveToIteration(0)).toBe("0");
    });
});

test("up, down, left, right", () => {
    const nav = new Navigator(map);
    expect(nav.up()).toBe("a");
    expect(nav.up()).toBe("a");
    expect(nav.right()).toBe("b");
    expect(nav.right()).toBe("b");
    expect(nav.left()).toBe("a");
    expect(nav.left()).toBe("a");
    expect(nav.right()).toBe("b");
    expect(nav.down()).toBe("c");
    expect(nav.up()).toBe("a");
    expect(nav.up()).toBe("a");
    expect(nav.down()).toBe("c");
    expect(nav.down()).toBe("d");
    expect(nav.down()).toBe("e");
    expect(nav.down()).toBe("f");
    expect(nav.right()).toBe("g");
    expect(nav.right()).toBe("g");
    expect(nav.down()).toBe("h");
});

test("Will either travel to a valid node, or not travel at all", () => {
    const nav = new Navigator(map);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.down()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.left()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.right()).not.toBe(null);
    expect(nav.up()).not.toBe(null);
    expect(nav.up()).not.toBe(null);
    expect(nav.up()).not.toBe(null);
    expect(nav.up()).not.toBe(null);
    expect(nav.up()).not.toBe(null);
    expect(nav.up()).not.toBe(null);
});

describe("next, prev functions", () => {
    const map: string[][] = [
        ["1", "2"],
        ["3", "4"],
    ];
    const nav = new Navigator(map);

    test("NEXT: 1 => 2", () => {
        expect(nav.next()).toBe("2");
    });
    test("NEXT: 2 => 3", () => {
        expect(nav.next()).toBe("3");
    });
    test("NEXT: 3 => 4", () => {
        expect(nav.next()).toBe("4");
    });
    test("NEXT: 4 => 1", () => {
        expect(nav.next()).toBe("1");
    });
    test("PREV: 1 => 4", () => {
        expect(nav.prev()).toBe("4");
    });
    test("PREV: 4 => 3", () => {
        expect(nav.prev()).toBe("3");
    });
    test("PREV: 3 => 2", () => {
        expect(nav.prev()).toBe("2");
    });
});

describe("util: equalInitializers", () => {
    describe("equal", () => {
        test("1", () => {
            const map1 = [["1", "2"], ["3"]];
            const map2 = [["1", "2"], ["3"]];
            expect(equalInitializers(map1, map2)).toBe(true);
        });
        test("2", () => {
            const map1 = [["1", "2"], ["3", "4", "5"], [], ["6"]];
            const map2 = [["1", "2"], ["3", "4", "5"], [], ["6"]];
            expect(equalInitializers(map1, map2)).toBe(true);
        });
    });

    describe("not equal", () => {
        test("height desc", () => {
            const map1 = [["1", "2"], ["3"], ["4"]];
            const map2 = [["1", "2"], ["3"]];
            expect(equalInitializers(map1, map2)).toBe(false);
        });
        test("height asc", () => {
            const map1 = [["1", "2"], ["3"]];
            const map2 = [["1", "2"], ["3", "4", "5"], [], ["6"]];
            expect(equalInitializers(map1, map2)).toBe(false);
        });
        test("width asc", () => {
            const map1 = [["1"], ["3"]];
            const map2 = [["1", "2"], ["3"]];
            expect(equalInitializers(map1, map2)).toBe(false);
        });
        test("width desc", () => {
            const map1 = [["1", "2"], ["3"]];
            const map2 = [["1"], ["3"]];
            expect(equalInitializers(map1, map2)).toBe(false);
        });
    });
});
