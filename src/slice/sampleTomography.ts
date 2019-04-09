import * as fs from "fs";
import * as path from "path";
import {Image as ImageJS} from "image-js";

import {SliceLimits, SliceLimitsData} from "./sliceLimits";
import {NumericVector2, Vector3} from "../util/vector";

export type Threshold = NumericVector2

export type PixelSize = Vector3<number>;
export type Origin = Vector3<number>;

export type SliceImageStack = [ImageJS, ImageJS];

export enum SlicePlane {
    Undefined = 0,
    Sagittal,
    Horizontal,
    Coronal
}

export function parseSlicePlaneIdentifier(id: number | string): SlicePlane {
    if (typeof id === "string" && id.length > 0) {
        const plane = parseInt(id);

        if (!isNaN(plane)) {
            return plane as SlicePlane || SlicePlane.Undefined;
        }

        const lower = id.toLowerCase();

        return SlicePlane[lower.charAt(0).toUpperCase() + lower.slice(1)] || SlicePlane.Undefined;
    }

    return id as SlicePlane || SlicePlane.Undefined;
}

export interface ISampleSliceContentData {
    "id": string;
    "displayRange": [number, number];
    "sampleName": string;
    "pixelSize": [number, number, number];
    "origin": [number, number, number];
    "limits": SliceLimitsData;
}


export class SampleTomography {
    private readonly _pathRoot: string;
    private readonly _id: string;

    private readonly _name: string;
    private readonly _origin: Origin;
    private readonly _limits: SliceLimits;
    private readonly _pixelSize: PixelSize;
    private readonly _threshold: Threshold;

    public constructor(pathRoot: string, data: ISampleSliceContentData) {
        this._pathRoot = pathRoot;

        this._id = data.id;
        this._name = data.sampleName;
        this._origin = new Vector3<number>(data.origin);
        this._limits = new SliceLimits();
        this._pixelSize = new Vector3<number>(data.pixelSize);
        this._threshold = new NumericVector2(data.displayRange);
    }

    public get id(): string {
        return this._id;
    }

    public get name(): string {
        return this._name;
    }

    public get origin(): Vector3<number> {
        return this._origin;
    }

    public get pixelSize(): Vector3<number> {
        return this._pixelSize;
    }

    public get threshold(): Threshold {
        return this._threshold;
    }

    public get limits(): SliceLimits {
        return this._limits;
    }

    public async loadSlice(plane: SlicePlane, location: number, invert: boolean = false, userThreshold?: Threshold): Promise<SliceImageStack> {
        const path = this.findSlice(plane, location);

        if (path != null) {
            const threshold = userThreshold || this._threshold;

            const scaling = 0xFFFF / Math.min(threshold.Max, 0xFFFF) - Math.max(threshold.Min, 0);

            const image = await ImageJS.load(path);
            const maskImage = await ImageJS.createFrom(image, {});

            for (let idx = 0; idx < image.data.length; idx++) {
                maskImage.data[idx] = image.data[idx] === 0 ? 0 : 0xFFFF;
                const shifted = image.data[idx] - threshold.Min;
                image.data[idx] = Math.min((Math.max(shifted, 0)), threshold.Max) * scaling;
                // maskImage.data[idx] = shifted <= 0 ? 0 : 0xFFFF;
            }

            if (invert) {
                image.invert({inPlace: true});
            }

            return [image, maskImage];
        } else {
            return null;
        }
    }

    private findSlice(plane: SlicePlane, location: number): string {
        if (plane === undefined || location === undefined) {
            return null;
        }

        const index = Math.floor(location / 25);

        const file = path.join(this._pathRoot, `${SlicePlane[plane].toLowerCase()}/${index}.png`);

        return fs.existsSync(file) ? file : null;
    }
}
