import { describe, it, expect } from "vitest";
import Register from "../keybinds/Register.js";
import { KbConfig } from "../keybinds/useKeybinds.js";
import { HEX_MAP } from "../keybinds/HexMap.js";

const ctrl_plus_letters = {
    ctrlA: { key: "ctrl", input: "a" },
    ctrlB: { key: "ctrl", input: "b" },
    ctrlC: { key: "ctrl", input: "c" },
    ctrlD: { key: "ctrl", input: "d" },
    ctrlE: { key: "ctrl", input: "e" },
    ctrlF: { key: "ctrl", input: "f" },
    ctrlG: { key: "ctrl", input: "g" },
    ctrlH: { key: "ctrl", input: "h" },
    ctrlI: { key: "ctrl", input: "i" },
    ctrlJ: { key: "ctrl", input: "j" },
    ctrlK: { key: "ctrl", input: "k" },
    ctrlL: { key: "ctrl", input: "l" },
    ctrlM: { key: "ctrl", input: "m" },
    ctrlN: { key: "ctrl", input: "n" },
    ctrlO: { key: "ctrl", input: "o" },
    ctrlP: { key: "ctrl", input: "p" },
    ctrlQ: { key: "ctrl", input: "q" },
    ctrlR: { key: "ctrl", input: "r" },
    ctrlS: { key: "ctrl", input: "s" },
    ctrlT: { key: "ctrl", input: "t" },
    ctrlU: { key: "ctrl", input: "u" },
    ctrlV: { key: "ctrl", input: "v" },
    ctrlW: { key: "ctrl", input: "w" },
    ctrlX: { key: "ctrl", input: "x" },
    ctrlY: { key: "ctrl", input: "y" },
    ctrlZ: { key: "ctrl", input: "z" },
} satisfies KbConfig;

describe("ctrl + lowercase a - z", () => {
    it(`ctrl + a`, () => {
        Register.handleKeypress("\u0001");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlA");
    });
    it("ctrl + b", () => {
        Register.handleKeypress("\u0002");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlB");
    });
    // ------ This will trigger a SIGINT -----
    // it("ctrl + c", () => {
    //     Register.handleKeypress("\u0003");
    //     Register.processConfig(ctrl_plus_letters);
    //     console.log(Register.getCommand());
    //     expect(Register.getCommand()).toBe("ctrlC");
    // });
    it("ctrl + d", () => {
        Register.handleKeypress("\u0004");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlD");
    });
    it("ctrl + e", () => {
        Register.handleKeypress("\u0005");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlE");
    });
    it("ctrl + f", () => {
        Register.handleKeypress("\u0006");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlF");
    });
    it("ctrl + g", () => {
        Register.handleKeypress("\u0007");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlG");
    });
    it("ctrl + h", () => {
        Register.handleKeypress("\u0008");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlH");
    });
    it("ctrl + i", () => {
        Register.handleKeypress("\u0009");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlI");
    });
    it("ctrl + j", () => {
        Register.handleKeypress("\u000A");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlJ");
    });
    it("ctrl + k", () => {
        Register.handleKeypress("\u000B");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlK");
    });
    it("ctrl + l", () => {
        Register.handleKeypress("\u000C");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlL");
    });
    it("ctrl + m", () => {
        Register.handleKeypress("\u000D");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlM");
    });
    it("ctrl + n", () => {
        Register.handleKeypress("\u000E");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlN");
    });
    it("ctrl + o", () => {
        Register.handleKeypress("\u000F");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlO");
    });
    it("ctrl + p", () => {
        Register.handleKeypress("\u0010");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlP");
    });
    it("ctrl + q", () => {
        Register.handleKeypress("\u0011");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlQ");
    });
    it("ctrl + r", () => {
        Register.handleKeypress("\u0012");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlR");
    });
    it("ctrl + s", () => {
        Register.handleKeypress("\u0013");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlS");
    });
    it("ctrl + t", () => {
        Register.handleKeypress("\u0014");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlT");
    });
    it("ctrl + u", () => {
        Register.handleKeypress("\u0015");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlU");
    });
    it("ctrl + v", () => {
        Register.handleKeypress("\u0016");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlV");
    });
    it("ctrl + w", () => {
        Register.handleKeypress("\u0017");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlW");
    });
    it("ctrl + x", () => {
        Register.handleKeypress("\u0018");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlX");
    });
    it("ctrl + y", () => {
        Register.handleKeypress("\u0019");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlY");
    });
    it("ctrl + z", () => {
        Register.handleKeypress("\u001A");
        Register.processConfig(ctrl_plus_letters);
        expect(Register.getCommand()).toBe("ctrlZ");
    });
});

describe("special key presses clear char register", () => {
    it("backspace", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.backspace);
        expect(Register.getCharRegister()).toBe("");
    });
    it("delete", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.delete);
        expect(Register.getCharRegister()).toBe("");
    });
    it("esc", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.esc);
        expect(Register.getCharRegister()).toBe("");
    });
    it("insert", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.insert);
        expect(Register.getCharRegister()).toBe("");
    });
    it("return", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.return);
        expect(Register.getCharRegister()).toBe("");
    });
    it("tab", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.tab);
        expect(Register.getCharRegister()).toBe("");
    });
    it("up", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.up);
        expect(Register.getCharRegister()).toBe("");
    });
    it("down", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.down);
        expect(Register.getCharRegister()).toBe("");
    });
    it("left", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.left);
        expect(Register.getCharRegister()).toBe("");
    });
    it("right", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.right);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f1", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f1);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f2", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f2);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f3", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f3);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f4", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f4);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f5", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f5);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f6", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f6);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f7", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f7);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f8", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f8);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f9", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f9);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f10", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f10);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f11", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f11);
        expect(Register.getCharRegister()).toBe("");
    });
    it("f12", () => {
        Register.handleKeypress("a");
        Register.handleKeypress(HEX_MAP.f12);
        expect(Register.getCharRegister()).toBe("");
    });
});

const foobar = {
    foo: [{ input: "f" }, { input: "F" }, { input: "!@" }, { input: "#$" }],
    bar: [{ key: "ctrl", input: "b" }, { input: "bb" }, { input: "%^" }],
    baz: [{ key: "f1" }, { input: "Ba" }],
    quz: [{ input: "qQ" }, { input: "QQ" }],
} satisfies KbConfig;

describe("Keybinds trigger commands correctly and clear char register after", () => {
    // foo
    it("'f' triggers 'foo'", () => {
        Register.handleKeypress("f");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("foo");
    });
    it("'F' triggers 'foo'", () => {
        Register.handleKeypress("F");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("foo");
    });
    it("'!@' triggers 'foo'", () => {
        Register.handleKeypress("!");
        Register.handleKeypress("@");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("foo");
    });
    it("'#$' triggers 'foo'", () => {
        Register.handleKeypress("#");
        Register.handleKeypress("$");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("foo");
    });

    // bar
    it("'ctrl + b' triggers 'bar'", () => {
        Register.handleKeypress("\u0002");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("bar");
    });
    it("'bb' triggers 'bar'", () => {
        Register.handleKeypress("b");
        Register.handleKeypress("b");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("bar");
    });
    it("'%^' triggers 'bar'", () => {
        Register.handleKeypress("%");
        Register.handleKeypress("^");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("bar");
    });

    // baz
    it("'f1' triggers 'baz'", () => {
        Register.handleKeypress(HEX_MAP.f1);
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("baz");
    });
    it("'Ba' triggers 'baz'", () => {
        Register.handleKeypress("B");
        Register.handleKeypress("a");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("baz");
    });

    // quz
    it("'qQ' triggers 'quz'", () => {
        Register.handleKeypress("q");
        Register.handleKeypress("Q");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("quz");
    });
    it("'QQ' triggers 'quz'", () => {
        Register.handleKeypress("Q");
        Register.handleKeypress("Q");
        Register.processConfig(foobar);
        expect(Register.getCommand()).toBe("quz");
    });
});

describe("notKey, notInput, and empty object", () => {
    it("empty object should trigger on any key press", () => {
        Register.handleKeypress("a");
        Register.processConfig({ press_any_key: {} });
        expect(Register.getCommand()).toBe("press_any_key");
    });

    const cfg1 = {
        not_esc_or_return: { notKey: ["esc", "return"] },
        esc_or_return: [{ key: "esc" }, { key: "return" }],
    } satisfies KbConfig;

    it("anything but escape or return triggers command", () => {
        Register.handleKeypress("b");
        Register.processConfig(cfg1);
        expect(Register.getCommand()).toBe("not_esc_or_return");
    });

    it("esc or return triggers command", () => {
        Register.handleKeypress(HEX_MAP.esc);
        Register.processConfig(cfg1);
        expect(Register.getCommand()).toBe("esc_or_return");
    });

    it("any key but 'a'", () => {
        Register.handleKeypress("b");
        Register.processConfig({ not_a: { notInput: ["a"] } });
        expect(Register.getCommand()).toBe("not_a");
    });
});
