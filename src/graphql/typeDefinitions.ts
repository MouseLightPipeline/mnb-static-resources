import {gql} from "apollo-server-express";

let typeDefinitions = gql`
scalar Date

"""
The range of valid indices for requesting slices for each plane.  Not necessary if requesting by actual location.m
"""
type SliceLimits {
    """2-element vector for min/max of range."""
    sagittal: [Float]
    """2-element vector for min/max of range."""
    horizontal: [Float]
    """2-element vector for min/max of range."""
    coronal: [Float]
}

"""
Metadata for available image slices for a given sample.  This information is no required for typical slice 
requests where a a location is provided, other than the sample id.
"""
type TomographyMetadata {
    id: String
    name: String
    origin: [Float]
    pixelSize: [Float]
    threshold: [Float]
    limits: SliceLimits
}

type Query {
    """Provides all tomography metadata."""
    tomographyMetadata: [TomographyMetadata!]
}


schema {
  query: Query
}`;

export default typeDefinitions;
