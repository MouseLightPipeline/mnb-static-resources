import * as path from "path";
import * as fs from "fs";

const debug = require("debug")("mnb:static-resources:tomography-manager");

import {SampleTomography} from "./sampleTomography";
import {Vector2} from "../util/vector";
import {ServiceOptions} from "../options/serviceOptions";

export class TomographyManager {
    private static _tomographyIdMap = new Map<string, SampleTomography>();
    private static _tomographyNameMap = new Map<string, SampleTomography>();

    public static LoadSampleTomography(source?: string) {
        const location = source || ServiceOptions.sliceMountPoint;

        if (!fs.existsSync(location)) {
            debug(`slice root location ${location} does not exist - no tomography metadata will be loaded`);
            return;
        }

        const files = fs.readdirSync(location).filter(f => {
            return fs.lstatSync(path.join(location, f)).isDirectory();
        });

        let sampleCount = 0;

        files.map(f => {
            const dataFile = path.join(location, f, "sampleInfo.json");

            if (fs.existsSync(dataFile)) {
                try {
                    const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

                    const tomography = new SampleTomography(path.join(location, f), data);

                    this._tomographyIdMap.set(tomography.id, tomography);

                    this._tomographyNameMap.set(tomography.name, tomography);

                    tomography.limits.sagittal = new Vector2<number>(this.findLimits(path.join(location, f, "Sagittal")));
                    tomography.limits.horizontal = new Vector2<number>(this.findLimits(path.join(location, f, "Horizontal")));
                    tomography.limits.coronal = new Vector2<number>(this.findLimits(path.join(location, f, "Coronal")));

                    sampleCount += 1;

                    debug(`loaded tomography using ${dataFile}`);
                    debug(tomography);

                } catch (ex) {
                    debug(`error creating sample tomography for ${dataFile}`);
                }
            }
        });

        debug(`loaded tomography metadata for ${sampleCount} sample(s)`);
    }

    public static asList(): SampleTomography[] {
        return Array.from(this._tomographyIdMap.values());
    }

    public static FindTomography(idOrName: string) {
        return this.getById(idOrName) || this.getByName(idOrName);
    }

    private static getById(id: string) {
        return this._tomographyIdMap.has(id) ? this._tomographyIdMap.get(id) : null;
    }

    private static getByName(name: string) {
        return this._tomographyNameMap.has(name) ? this._tomographyNameMap.get(name) : null;
    }

    private static findLimits(location: string): [number, number] {
        return fs.readdirSync(path.join(location)).filter(p => {
            return p.endsWith(".png");
        }).reduce((prev, curr) => {
            const index = parseInt(curr.slice(0, -4));

            if (!isNaN(index)) {
                if (isNaN(prev[0]) || prev[0] > index) {
                    prev[0] = index;
                }
                if (isNaN(prev[1]) || prev[1] < index) {
                    prev[1] = index;
                }
            }

            return prev;
        }, [NaN, NaN] as [number, number]);
    }
}
