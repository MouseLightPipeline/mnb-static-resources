import * as express from "express";
import * as os from "os";
import * as path from "path";

const debug = require("debug")("mnb:static-resources:server");

import {ServiceOptions} from "./options/serviceOptions";
import {sliceMiddleware} from "./middleware/sliceMiddleware";

const app = express();

if (process.env.NODE_ENV !== "production") {
    app.use(ServiceOptions.endpoint, express.static(path.resolve(path.normalize("assets"))));
    app.use("/slice", sliceMiddleware);
} else {
    app.use(ServiceOptions.endpoint, express.static("static"));
}

app.listen(ServiceOptions.port, () => debug(`listening on http://${os.hostname()}:${ServiceOptions.port}`));
