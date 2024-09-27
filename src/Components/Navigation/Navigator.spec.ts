import { describe, expect, test } from "vitest";
import { Navigator, Initializer } from "./Navigator.js";

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
    test("f", () => {
        const nav = new Navigator(map, "f");
        expect(nav.getLocation()).toBe("f");
    });
    test("g", () => {
        const nav = new Navigator(map, "g");
        expect(nav.getLocation()).toBe("g");
    });
    test("h", () => {
        const nav = new Navigator(map, "h");
        expect(nav.getLocation()).toBe("h");
    });

    test("invalid starting node defaults safely", () => {
        const nav = new Navigator(map, "z");
        expect(nav.getLocation()).toBe("a");
    });
});

describe("Handles different initializers", () => {
    test("Empty initializer '[[]]' throws error", () => {
        const map = [[]];
        expect(() => {
            new Navigator(map);
        }).toThrow();
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
