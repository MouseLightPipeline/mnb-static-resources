export class Vector2<T> extends Array<T> {
    public constructor(input?: [T, T]) {
        super();

        if (input) {
            this[0] = input[0];
            this[1] = input[1];
        }
    }

    public get X(): T {
        return this[0];
    }

    public get Y(): T {
        return this[1];
    }

    public get Min(): T {
        return this[0];
    }

    public get Max(): T {
        return this[1];
    }
}

export class Vector3<T> extends Vector2<T> {
    public constructor(input?: [T, T, T]) {
        super();

        if (input) {
            this[0] = input[0];
            this[1] = input[1];
            this[2] = input[2];
        }
    }

    public get Z(): T {
        return this[2];
    }
}

export class NumericVector2 extends Vector2<number> {
    public static parseString(input: string): NumericVector2 {
        if (!input) {
            return null;
        }

        const parts = input.split(",");

        if (parts.length === 2) {
            const a = parseInt(parts[0]);
            const b = parseInt(parts[1]);

            if (!isNaN(a) && !isNaN(b)) {
                return new NumericVector2([a, b]);
            }
        }

        return null;
    }

    [key: number] : number;
}
