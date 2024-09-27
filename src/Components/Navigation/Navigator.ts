export type Initializer = string[][];
export type Coords = [number, number];

export class Navigator {
    private nav: Initializer;
    private curr!: Coords;
    private prevMap: { [key: string]: Coords };
    private nextMap: { [key: string]: Coords };
    private iterationMap: { [key: string]: number };
    private size: number;
    private iteration: number;

    constructor(nav: Initializer, startingNode?: string) {
        this.nav = nav;
        this.prevMap = {};
        this.nextMap = {};
        this.iterationMap = {};
        this.size = 0;
        this.iteration = 0;
        this.init(nav, startingNode);
    }

    private init = (nav: Initializer, startingNode?: string): void => {
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

                this.iterationMap[name] = size;
                ++size;

                if (
                    (startingNode && startingNode === name) ||
                    !currStartCoords
                ) {
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
            }
        }

        // prettier-ignore
        if (!startName || !prevCoords || !startCoords || !prevName || !currStartCoords) {
            throw new Error("Invalid navigation initializer");
        }

        this.size = size;
        this.prevMap[startName] = prevCoords;
        this.nextMap[prevName] = startCoords;
        this.curr = currStartCoords;
    };

    public getLocation = (): string => {
        const [y, x] = this.curr;
        return this.nav[y][x];
    };

    public getIteration = (): number => {
        return this.iteration;
    };

    public getSize = (): number => {
        return this.size;
    };

    private autoMove = (dir: -1 | 1): string => {
        const name = this.getLocation();
        const nextCoords = dir < 0 ? this.prevMap[name] : this.nextMap[name];

        this.curr = nextCoords;
        const nextName = this.getLocation();
        this.iteration = this.iterationMap[nextName];

        return nextName;
    };

    public next = (): string => {
        return this.autoMove(1);
    };

    public prev = (): string => {
        return this.autoMove(-1);
    };

    private move = (dy: number, dx: number): string => {
        const [y, x] = this.curr;
        const ny = y + dy;
        let nx = x + dx;

        if (this.nav[ny]?.[nx]) {
            this.curr = [ny, nx];
        }

        if (this.nav[ny]?.[nx] === undefined) {
            if (this.nav[ny]?.length === 0 || nx <= 0) {
                return this.getLocation();
            }

            while (nx > this.nav[ny]?.length - 1) {
                --nx;
            }

            if (this.nav[ny]?.[nx]) {
                this.curr = [ny, nx];
            }
        }

        const name = this.getLocation();
        this.iteration = this.iterationMap[name];

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
