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

        this._id = sampleIdNameMap[data.sampleName] || data.sampleName;

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

    public async loadSlice(plane: SlicePlane, location: number, invert: boolean = false, userThreshold?: NumericVector2): Promise<SliceImageStack> {
        const path = this.findSlice(plane, location);

        if (path != null) {
            const threshold = userThreshold || this._threshold;

            const scaling = 0xFFFF / (Math.min(threshold.Max, 0xFFFF) - Math.max(threshold.Min, 0));

            const image = await ImageJS.load(path);
            const maskImage = await ImageJS.createFrom(image, {});

            for (let idx = 0; idx < image.data.length; idx++) {
                maskImage.data[idx] = image.data[idx] === 0 ? 0 : 0xFFFF;
                const shifted = image.data[idx] - threshold.Min;
                image.data[idx] = Math.min((Math.max(shifted * scaling, 0)), 0xFFFF);
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

        const file = path.join(this._pathRoot, `${SlicePlane[plane].toString()}/${index}.png`);

        return fs.existsSync(file) ? file : null;
    }
}

// This is information that should be mapped from the sample info in the search database, however a) it does not
// currently include the sample date and b) this is not set up to pull from the database or graphql api at the moment.
const sampleIdNameMap = new Map<string, string>();

sampleIdNameMap["allen-reference"] = "64f40090-1e7f-411e-bed1-497060dbd2be";

sampleIdNameMap["2014-06-24"] = "a788ba0c-442d-4586-804b-57675117b19a";
sampleIdNameMap["2015-06-19"] = "18a038ff-5830-487d-ab3a-bace44f87ee3";
sampleIdNameMap["2015-07-11"] = "ad1f720a-4e06-4ce4-9d87-2e7dd7a46aad";
sampleIdNameMap["2016-04-04"] = "4aa02a4b-e7c0-4960-9497-214fa97491bc";
sampleIdNameMap["2016-07-18"] = "25bb1462-05a3-4416-a1f3-a687ad3a42f6";
sampleIdNameMap["2016-10-25"] = "a4c4ea63-8d75-4bcd-b79e-97b6c86d730a";
sampleIdNameMap["2016-10-31"] = "582e08ac-7866-4a4a-b7b8-96c317c01083";
sampleIdNameMap["2017-01-15"] = "9e72f7ed-e2be-4383-a3b9-77182c6acfe2";
sampleIdNameMap["2017-02-22"] = "5ec58ca0-c39c-4caa-b48a-25a71e2ea79c";
sampleIdNameMap["2017-04-19"] = "51c092c9-794f-44fc-b9f0-a8942df373fe";
sampleIdNameMap["2017-05-04"] = "55e0ef1f-23a4-4737-8cf1-613a6dacf6ac";
sampleIdNameMap["2017-06-10"] = "15cc7868-b3a6-46ed-8c75-83849716002f";
sampleIdNameMap["2017-06-28"] = "e212ce76-7bfd-4f5c-a73b-490ce568303f";
sampleIdNameMap["2017-08-10"] = "242e4fc9-a4d0-4607-9e4d-2fc6f31455c0";
sampleIdNameMap["2017-08-28"] = "44efc415-e40e-42eb-b648-b6456460c7ae";
sampleIdNameMap["2017-09-11"] = "ae46e4ac-74a1-433a-8de3-ca9625547939";
sampleIdNameMap["2017-09-19"] = "569a4d51-7053-452d-9e12-1153c89bd6b2";
sampleIdNameMap["2017-09-25"] = "e2b30c42-58c1-4fe3-9727-6651e5671712";
sampleIdNameMap["2017-10-31"] = "4ddc94ad-8ca3-4368-b48b-2694258fbded";
sampleIdNameMap["2017-11-17"] = "af2a1916-af75-41c5-9425-9fa30be4ccc5";
sampleIdNameMap["2017-12-19"] = "c1a31e4e-3d5e-4e68-afb5-4759ae713ce6";
sampleIdNameMap["2018-01-30"] = "dca41869-3483-4873-9f17-c82702137a06";
sampleIdNameMap["2018-03-09"] = "b26406e6-ad1a-4050-9954-2cee3ae4a23c";
sampleIdNameMap["2018-04-03"] = "ed6bb3c4-68c1-438f-9ea8-189ad43e87de";
sampleIdNameMap["2018-04-13"] = "24366630-6295-4728-a073-4e92b9a3e1a6";
sampleIdNameMap["2018-05-23"] = "392c3da3-808f-473b-8784-cd4d64a2230b";
sampleIdNameMap["2018-06-14"] = "b52f5456-0a89-4b2c-87f0-f138c710052c";
sampleIdNameMap["2018-07-02"] = "8863c227-5a76-4c09-9558-3d74be0f4ec0";
sampleIdNameMap["2018-08-01"] = "ffd28be1-3815-4d15-957d-8a9a6de95719";
sampleIdNameMap["2018-10-01"] = "ed0d5f76-7e53-4051-81fc-16f4ea7b523c";
