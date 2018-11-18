import * as express from "express";
import * as os from "os";

const debug = require("debug")("mnb:static-resources:server");

import {ServiceOptions} from "./options/serviceOptions";
import * as path from "path";

const app = express();

if (process.env.NODE_ENV !== "production") {
    app.use("/public", express.static(path.resolve(path.normalize("assets"))));
} else {
    app.use(express.static("public"));
}

app.listen(ServiceOptions.port, () => debug(`static resource server is now running on http://${os.hostname()}:${ServiceOptions.port}`));
