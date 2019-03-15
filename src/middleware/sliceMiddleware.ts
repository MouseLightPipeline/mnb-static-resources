import * as fs from "fs";
import {Image as ImageJS} from "image-js";

const scaling = 0xFFFF / 265;

enum SlicePlane {
    Coronal,
    Horizontal,
    Sagittal
}

type Coordinates = [number, number, number]

interface ISliceRequestBody {
    sampleId?: string;
    plane?: SlicePlane;
    coordinates?: Coordinates;
}

const planeLookup = new Map<SlicePlane, string>();
planeLookup.set(SlicePlane.Coronal, "coronal");
planeLookup.set(SlicePlane.Horizontal, "coronal");
planeLookup.set(SlicePlane.Sagittal, "sagittal");

function locateSlice(request: ISliceRequestBody): string {
    if (request.sampleId === undefined || request.plane === undefined || request.coordinates === undefined || request.coordinates.length !== 3 || !planeLookup.has(request.plane)) {
        return null;
    }

    const index = Math.floor(request.coordinates[2] / 25);

    return `assets/slice/${request.sampleId}/${planeLookup.get(request.plane)}/${index}.png`;
}

export async function sliceMiddleware(req, res) {
    const path = locateSlice(req.body);

    if (path === null || !fs.existsSync(path)) {
        res.status(404).send("Not found");
        return;
    }

    const image = await ImageJS.load(path);

    const image2 = await ImageJS.createFrom(image, {});

    for (let idx = 0; idx < image.data.length; idx++) {
        const shifted = image.data[idx] - 35;
        image.data[idx] = Math.min((Math.max(shifted, 0)), 300) * scaling;
        image2.data[idx] = shifted < 0 ? 0 : 0xFFFF;
    }

    res.json({
        texture: image.toBase64("image/png"),
        mask: image2.toBase64("image/png")
    });
}

export async function sliceImageMiddleware(req, res) {
    const path = locateSlice({
        sampleId: req.query.sampleId,
        plane: parseInt(req.query.plane),
        coordinates: [req.query.x, req.query.y,req.query.z]
    });

    if (path === null || !fs.existsSync(path)) {
        res.status(404).send("Not found");
        return;
    }

    const image = await ImageJS.load(path);

    for (let idx = 0; idx < image.data.length; idx++) {
        const shifted = image.data[idx] - 35;
        image.data[idx] = Math.min((Math.max(shifted, 0)), 300) * scaling;
    }

    res.type("png");
    res.end(new Buffer(image.toBuffer()), "binary");
}
