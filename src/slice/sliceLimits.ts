import {Vector2, Vector3} from "../util/vector";

export type SliceRange = Vector2<number>;
export type SliceLimitsData = Vector3<SliceRange>

export class SliceLimits {
    public sagittal: SliceRange = new Vector2<number>([0, 0]);
    public horizontal: SliceRange = new Vector2<number>([0, 0]);
    public coronal: SliceRange = new Vector2<number>([0, 0]);

    public constructor(data?: SliceLimitsData) {
        if (data) {
            this.sagittal = data[0];
            this.horizontal = data[1];
            this.coronal = data[2];
        }
    }
}
