import * as express from "express";
import * as os from "os";

const debug = require("debug")("mnb:static-resources:server");

import {ServiceOptions} from "./options/serviceOptions";
import * as path from "path";

const app = express();

if (process.env.NODE_ENV !== "production") {
    app.use(ServiceOptions.endpoint, express.static(path.resolve(path.normalize("assets"))));
} else {
    app.use(ServiceOptions.endpoint, express.static("static"));
}

app.listen(ServiceOptions.port, () => debug(`listening on http://${os.hostname()}:${ServiceOptions.port}`));
