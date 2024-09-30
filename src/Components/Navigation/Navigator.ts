import assert from "assert";

export type Initializer = string[][];
export type Coords = [number, number];
export type NavigatorPublicMethods = Omit<
    { [P in keyof Navigator]: Navigator[P] },
    "getIteration" | "getSize"
>;

export class Navigator {
    private nav: Initializer;
    private currCoords!: Coords;
    private nameMap: { [name: string]: { coords: Coords; iteration: number } };
    private prevMap: { [name: string]: Coords };
    private nextMap: { [name: string]: Coords };
    private size: number;

    constructor(nav: Initializer, startingNode?: string | number) {
        this.nav = nav;
        this.prevMap = {};
        this.nextMap = {};
        this.nameMap = {};
        this.size = 0;
        this.init(nav, startingNode);
        // console.log(`init location: ${this.getLocation()}`);
    }

    private init = (nav: Initializer, startingNode?: string | number): void => {
        let currStartCoords: Coords | null = null;

        let prevCoords: Coords | null = null;
        let prevName: string | null = null;

        let startName: string | null = null;
        let startCoords: Coords | null = null;

        let size = 0;
        for (let y = 0; y < nav.length; ++y) {
            for (let x = 0; x < nav[y].length; ++x) {
                const name = nav[y][x];
                const currCoords: [number, number] = [y, x];

                if (!name) continue;

                this.nameMap[name] = { coords: currCoords, iteration: size };

                if (!currStartCoords) {
                    currStartCoords = currCoords;
                }
                if (typeof startingNode === "string" && startingNode === name) {
                    currStartCoords = currCoords;
                }
                if (typeof startingNode === "number" && startingNode === size) {
                    currStartCoords = currCoords;
                }

                if (prevCoords === null) {
                    startName = name;
                    startCoords = currCoords;
                }

                if (prevName) {
                    this.nextMap[prevName] = currCoords;
                }
                prevName = name;

                if (prevCoords) {
                    this.prevMap[name] = prevCoords;
                }

                prevCoords = currCoords;
                ++size;
            }
        }

        // prettier-ignore
        if (!startName || !prevCoords || !startCoords || !prevName || !currStartCoords) {
            // throw new Error("Invalid navigation initializer");
            this.size = size;
            this.currCoords = [-1, -1];
            return;
        }

        this.size = size;
        this.prevMap[startName] = prevCoords;
        this.nextMap[prevName] = startCoords;
        this.currCoords = currStartCoords;
    };

    public getLocation = (): string => {
        try {
            const [y, x] = this.currCoords;
            return this.nav[y][x];
        } catch {
            return "";
        }
    };

    public getIteration = (): number => {
        const name = this.getLocation();

        return this.nameMap[name]?.iteration || -1;
    };

    public getSize = (): number => {
        return this.size;
    };

    public moveToIteration = (n: number): string => {
        if (n >= this.getSize() || n < 0) {
            return this.getLocation();
        }

        let nextCoords: Coords | undefined = undefined;
        for (const name in this.nameMap) {
            if (this.nameMap[name].iteration === n) {
                nextCoords = this.nameMap[name].coords;
                break;
            }
        }

        assert(nextCoords);
        this.currCoords = nextCoords;

        return this.getLocation();
    };

    private autoMove = (dir: -1 | 1): string => {
        const name = this.getLocation();
        if (name === "") return "";

        const nextCoords = dir < 0 ? this.prevMap[name] : this.nextMap[name];

        this.currCoords = nextCoords;
        const nextName = this.getLocation();

        return nextName;
    };

    public next = (): string => {
        return this.autoMove(1);
    };

    public prev = (): string => {
        return this.autoMove(-1);
    };

    private move = (dy: number, dx: number): string => {
        const [y, x] = this.currCoords;
        const ny = y + dy;
        let nx = x + dx;

        if (this.nav[ny]?.[nx]) {
            this.currCoords = [ny, nx];
        }

        if (this.nav[ny]?.[nx] === undefined) {
            if (this.nav[ny]?.length === 0 || nx <= 0) {
                return this.getLocation();
            }

            while (nx > this.nav[ny]?.length - 1) {
                --nx;
            }

            if (this.nav[ny]?.[nx]) {
                this.currCoords = [ny, nx];
            }
        }

        const name = this.getLocation();

        return name;
    };

    public up = (): string => {
        return this.move(-1, 0);
    };

    public down = (): string => {
        return this.move(1, 0);
    };

    public right = (): string => {
        return this.move(0, 1);
    };

    public left = (): string => {
        return this.move(0, -1);
    };
}
