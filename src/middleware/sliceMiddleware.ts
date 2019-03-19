import {parseSlicePlaneIdentifier} from "../slice/sampleTomography";
import {TomographyManager} from "../slice/tomographyManager";
import {NumericVector2} from "../util/vector";

interface ISliceRequestBody {
    id?: string;
    plane?: number;
    location?: number;
    threshold?: [number, number];
    mask?: boolean;
    invert?: boolean;
}

export async function sliceMiddleware(req, res) {
    const input: ISliceRequestBody = req.body;

    const tomography = TomographyManager.FindTomography(input.id);

    if (tomography) {
        const images = await tomography.loadSlice(parseSlicePlaneIdentifier(input.plane), input.location);

        if (images) {
            res.json({
                texture: images[0].toBase64("image/png"),
                mask: images[1].toBase64("image/png")
            });

            return;
        }
    }

    res.status(404).send("Not found");
}

interface ISliceRequestParams {
    id?: string;
    plane?: string;
    location?: string;
    threshold?: string;
    mask?: string;
    invert?: string;
}

export async function sliceImageMiddleware(req, res) {
    const input: ISliceRequestParams = req.query;

    const tomography = TomographyManager.FindTomography(input.id);

    if (tomography) {
        const images = await tomography.loadSlice(parseSlicePlaneIdentifier(input.plane), parseInt(input.location), parseInt(input.invert) === 1, NumericVector2.parseString(input.threshold));

        if (images) {
            const mask = parseInt(input.mask) > 0 ? 1 : 0;
            res.type("png");
            res.end(new Buffer((images[mask] as any).toBuffer()), "binary");

            return;
        }
    }

    res.status(404).send("Not found");
}
