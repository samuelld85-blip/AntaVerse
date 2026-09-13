import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
// world-atlas ships pre-built, public-domain (Natural Earth) topojson — no
// need to hand-draw or fetch country borders. The 110m resolution is plenty
// at the size this map renders on a phone screen and keeps the bundle small.
import rawWorldTopology from "world-atlas/countries-110m.json";

export interface CountryFeatureProperties {
  name: string;
}

type WorldTopology = Topology<{ countries: GeometryCollection<CountryFeatureProperties> }>;

const topology = rawWorldTopology as unknown as WorldTopology;

/**
 * Country outlines as GeoJSON, ready for d3-geo's `geoPath`. Each feature's
 * `id` is the ISO 3166-1 numeric code (as a string), matching `Country.id` in
 * `./countries` — that's how a search result or a rendered pin links back to
 * a shape on the map.
 */
export const WORLD_COUNTRY_FEATURES = feature(
  topology,
  topology.objects.countries,
) as unknown as FeatureCollection<Geometry, CountryFeatureProperties>;
