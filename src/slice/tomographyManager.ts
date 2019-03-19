import * as path from "path";
import * as fs from "fs";

import {SampleTomography, SlicePlane} from "./sampleTomography";
import {parse} from "querystring";
import {Vector2} from "../util/vector";

const SliceLocation = `assets/slice/`;

export class TomographyManager {
    private static _tomographyIdMap = new Map<string, SampleTomography>();
    private static _tomographyNameMap = new Map<string, SampleTomography>();

    public static LoadSampleTomography(source?: string) {
        const location = source || SliceLocation;

        const files = fs.readdirSync(location).filter(f => {
            return fs.lstatSync(path.join(location, f)).isDirectory();
        });

        files.map(f => {
            const dataFile = path.join(location, f, "sampleInfo.json");

            if (fs.existsSync(dataFile)) {
                const data = JSON.parse(fs.readFileSync(dataFile, "utf8"));

                const tomography = new SampleTomography(path.join(location, f), data);

                this._tomographyIdMap.set(tomography.id, tomography);

                this._tomographyNameMap.set(tomography.name, tomography);

                tomography.limits.sagittal = new Vector2<number>(this.findLimits(path.join(location, f, "sagittal")));
                tomography.limits.horizontal = new Vector2<number>(this.findLimits(path.join(location, f, "horizontal")));
                tomography.limits.coronal = new Vector2<number>(this.findLimits(path.join(location, f, "coronal")));
            }
        });
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
