import {Image as ImageJS} from "image-js";

const scaling = 0xFFFF / 265;

export async function sliceMiddleware(req, res) {

    const image = await ImageJS.load("assets/slice/sample-001/coronal/264.png");

    for (let idx = 0; idx < image.data.length; idx++) {
        image.data[idx] = Math.min((Math.max(image.data[idx] - 35, 0)), 300) * scaling;
    }

    res.send(image.toBase64("image/png"));
}
