import * as path from "path";
import * as os from "os";
import * as express from "express";
import bodyParser = require("body-parser");

const debug = require("debug")("mnb:static-resources:server");

import {ServiceOptions} from "./options/serviceOptions";
import {sliceImageMiddleware, sliceMiddleware} from "./middleware/sliceMiddleware";

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(bodyParser.json());

if (process.env.NODE_ENV !== "production") {
    app.use(ServiceOptions.endpoint, express.static(path.resolve(path.normalize("assets"))));
    app.use("/slice/", sliceMiddleware);
    app.use("/sliceImage", sliceImageMiddleware);
} else {
    app.use(ServiceOptions.endpoint, express.static("static"));
}

app.listen(ServiceOptions.port, () => debug(`listening on http://${os.hostname()}:${ServiceOptions.port}`));
