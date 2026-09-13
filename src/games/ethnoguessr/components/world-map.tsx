"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent, WheelEvent as ReactWheelEvent } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import type { Feature, Polygon } from "geojson";
import { WORLD_COUNTRY_FEATURES } from "@/games/ethnoguessr/lib/geo/world-topology";

// Antarctica and the high Arctic are mostly empty ocean/ice and would
// otherwise waste a huge chunk of a phone-shaped map on nothing — the
// projection is fitted to this latitude band instead of the whole globe.
const LAT_MIN = -58;
const LAT_MAX = 80;
const CROP_BOUNDS: Feature<Polygon> = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-180, LAT_MIN],
        [180, LAT_MIN],
        [180, LAT_MAX],
        [-180, LAT_MAX],
        [-180, LAT_MIN],
      ],
    ],
  },
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const TAP_THRESHOLD_PX = 6;

export interface MapMarker {
  lat: number;
  lon: number;
  kind: "guess" | "answer";
}

interface Point {
  x: number;
  y: number;
}

export function WorldMap({
  highlightCountryId,
  markers = [],
  onPick,
  className = "",
}: {
  /** Country id (matches `Country.id`/`feature.id`) to fill in the accent color. */
  highlightCountryId?: string;
  markers?: MapMarker[];
  /** Omit to render a read-only map (used on the result screen) — it can still be zoomed/panned. */
  onPick?: (point: { lat: number; lon: number }) => void;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  // zoom and pan are updated together (panning while zoomed needs the
  // current zoom to clamp correctly, and zooming needs the current pan to
  // keep the focal point fixed) — one state object keeps every update atomic
  // instead of two setState calls racing each other.
  const [view, setView] = useState({ zoom: MIN_ZOOM, pan: { x: 0, y: 0 } });
  const { zoom, pan } = view;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Read the size synchronously on mount rather than waiting for the first
    // ResizeObserver callback — that first callback isn't guaranteed to be
    // immediate (e.g. while the tab is backgrounded), and without this the
    // map would render nothing until it fires.
    const initial = el.getBoundingClientRect();
    if (initial.width > 0 && initial.height > 0) setSize({ width: initial.width, height: initial.height });

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) setSize({ width: rect.width, height: rect.height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Fit the crop band to CONTAIN within the container (the whole world is
  // visible at zoom level 1, whatever the container's aspect ratio — a
  // "cover" fit was tried here first but that crops off whichever dimension
  // has room to spare, which on a portrait phone screen means Asia and the
  // Americas are simply never reachable at any zoom/pan). Any leftover space
  // is just more ocean — the ocean rect below always spans the full
  // container, so it reads as sea, not as a dead gap outside the map.
  const projection = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;
    const proj = geoEquirectangular().scale(1).translate([0, 0]);
    const bounds = geoPath(proj).bounds(CROP_BOUNDS);
    const dataWidth = bounds[1][0] - bounds[0][0];
    const dataHeight = bounds[1][1] - bounds[0][1];
    const centerX = (bounds[0][0] + bounds[1][0]) / 2;
    const centerY = (bounds[0][1] + bounds[1][1]) / 2;
    const scale = 0.97 * Math.min(size.width / dataWidth, size.height / dataHeight);
    proj.scale(scale).translate([size.width / 2 - scale * centerX, size.height / 2 - scale * centerY]);
    return proj;
  }, [size]);

  const path = useMemo(() => (projection ? geoPath(projection) : null), [projection]);

  const projectedMarkers = useMemo(() => {
    if (!projection) return [];
    return markers
      .map((marker) => {
        const point = projection([marker.lon, marker.lat]);
        return point ? { kind: marker.kind, x: point[0], y: point[1] } : null;
      })
      .filter((marker): marker is { kind: MapMarker["kind"]; x: number; y: number } => marker !== null);
  }, [markers, projection]);

  const clampPan = useCallback(
    (nextPan: Point, nextZoom: number) => ({
      x: Math.min(0, Math.max(-size.width * (nextZoom - 1), nextPan.x)),
      y: Math.min(0, Math.max(-size.height * (nextZoom - 1), nextPan.y)),
    }),
    [size],
  );

  const zoomAt = useCallback(
    (focal: Point, nextZoomRaw: number) => {
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoomRaw));
      setView((current) => {
        const contentX = (focal.x - current.pan.x) / current.zoom;
        const contentY = (focal.y - current.pan.y) / current.zoom;
        const nextPan = clampPan({ x: focal.x - contentX * nextZoom, y: focal.y - contentY * nextZoom }, nextZoom);
        return { zoom: nextZoom, pan: nextPan };
      });
    },
    [clampPan],
  );

  // Wheel ticks fire in quick succession (fast trackpad flicks can queue
  // several before React re-renders) — reading the target zoom from `current`
  // inside the updater, rather than multiplying the closed-over `zoom` state,
  // keeps every tick building on the one before it instead of them all
  // computing the same stale target.
  const zoomByFactor = useCallback(
    (focal: Point, factor: number) => {
      setView((current) => {
        const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current.zoom * factor));
        const contentX = (focal.x - current.pan.x) / current.zoom;
        const contentY = (focal.y - current.pan.y) / current.zoom;
        const nextPan = clampPan({ x: focal.x - contentX * nextZoom, y: focal.y - contentY * nextZoom }, nextZoom);
        return { zoom: nextZoom, pan: nextPan };
      });
    },
    [clampPan],
  );

  const panBy = useCallback(
    (dx: number, dy: number) => {
      setView((current) => ({ ...current, pan: clampPan({ x: current.pan.x + dx, y: current.pan.y + dy }, current.zoom) }));
    },
    [clampPan],
  );

  function resetView() {
    setView({ zoom: MIN_ZOOM, pan: { x: 0, y: 0 } });
  }

  function pickAt(clientX: number, clientY: number, atZoom: number, atPan: Point) {
    if (!onPick || !projection || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const contentX = (clientX - rect.left - atPan.x) / atZoom;
    const contentY = (clientY - rect.top - atPan.y) / atZoom;
    const inverted = projection.invert?.([contentX, contentY]);
    if (!inverted) return;
    const [lon, lat] = inverted;
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90) return;
    onPick({ lat, lon: Math.max(-180, Math.min(180, lon)) });
  }

  // Single-pointer pan-or-tap (mouse/pen only — touch is handled below via
  // raw Touch events so it can also detect a second finger for pinch-zoom).
  const drag = useRef<{ id: number; startX: number; startY: number; lastX: number; lastY: number; moved: boolean } | null>(null);

  function handlePointerDown(event: ReactPointerEvent<SVGSVGElement>) {
    if (event.pointerType === "touch") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, moved: false };
  }

  function handlePointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    if (Math.abs(event.clientX - current.startX) > TAP_THRESHOLD_PX || Math.abs(event.clientY - current.startY) > TAP_THRESHOLD_PX) {
      current.moved = true;
    }
    if (current.moved) {
      const dx = event.clientX - current.lastX;
      const dy = event.clientY - current.lastY;
      current.lastX = event.clientX;
      current.lastY = event.clientY;
      panBy(dx, dy);
    }
  }

  function handlePointerUp(event: ReactPointerEvent<SVGSVGElement>) {
    const current = drag.current;
    drag.current = null;
    if (!current || current.id !== event.pointerId) return;
    if (!current.moved) pickAt(event.clientX, event.clientY, zoom, pan);
  }

  // Touch: one finger pans (or taps if it never moved), two fingers pinch-zoom.
  const touches = useRef(new Map<number, Point>());
  const pinch = useRef<{ startDistance: number; startZoom: number } | null>(null);

  function handleTouchStart(event: ReactTouchEvent<SVGSVGElement>) {
    for (const touch of Array.from(event.changedTouches)) {
      touches.current.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    }
    if (touches.current.size === 1) {
      const [id, point] = [...touches.current.entries()][0]!;
      drag.current = { id, startX: point.x, startY: point.y, lastX: point.x, lastY: point.y, moved: false };
    } else if (touches.current.size === 2) {
      drag.current = null;
      const [a, b] = [...touches.current.values()];
      pinch.current = { startDistance: distance(a!, b!), startZoom: zoom };
    }
  }

  function handleTouchMove(event: ReactTouchEvent<SVGSVGElement>) {
    for (const touch of Array.from(event.changedTouches)) {
      if (touches.current.has(touch.identifier)) touches.current.set(touch.identifier, { x: touch.clientX, y: touch.clientY });
    }
    if (touches.current.size >= 2 && pinch.current && containerRef.current) {
      const [a, b] = [...touches.current.values()];
      const rect = containerRef.current.getBoundingClientRect();
      const focal = { x: (a!.x + b!.x) / 2 - rect.left, y: (a!.y + b!.y) / 2 - rect.top };
      zoomAt(focal, pinch.current.startZoom * (distance(a!, b!) / pinch.current.startDistance));
      return;
    }
    const current = drag.current;
    const point = current ? touches.current.get(current.id) : undefined;
    if (!current || !point) return;
    if (Math.abs(point.x - current.startX) > TAP_THRESHOLD_PX || Math.abs(point.y - current.startY) > TAP_THRESHOLD_PX) {
      current.moved = true;
    }
    if (current.moved) {
      const dx = point.x - current.lastX;
      const dy = point.y - current.lastY;
      current.lastX = point.x;
      current.lastY = point.y;
      panBy(dx, dy);
    }
  }

  function handleTouchEnd(event: ReactTouchEvent<SVGSVGElement>) {
    for (const touch of Array.from(event.changedTouches)) {
      touches.current.delete(touch.identifier);
    }
    if (touches.current.size < 2) pinch.current = null;
    if (touches.current.size === 0) {
      const current = drag.current;
      drag.current = null;
      const endedTouch = Array.from(event.changedTouches)[0];
      if (current && !current.moved && endedTouch) pickAt(endedTouch.clientX, endedTouch.clientY, zoom, pan);
    }
  }

  function handleWheel(event: ReactWheelEvent<SVGSVGElement>) {
    // No event.preventDefault() here: React attaches wheel/touch listeners
    // passively, so it would just warn without doing anything — the map sits
    // in a fixed-height shell with nothing to scroll anyway. Touch's native
    // pan/pinch is blocked instead via the `touch-action: none` on `.eg-map`.
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    zoomByFactor({ x: event.clientX - rect.left, y: event.clientY - rect.top }, event.deltaY < 0 ? 1.25 : 0.8);
  }

  return (
    <div ref={containerRef} className={`eg-map-viewport ${className}`}>
      {projection && path ? (
        <svg
          viewBox={`0 0 ${size.width} ${size.height}`}
          className="eg-map"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onWheel={handleWheel}
          onDoubleClick={resetView}
          data-interactive={Boolean(onPick)}
          role="img"
          aria-label={onPick ? "Carte du monde — touchez pour placer votre réponse, pincez pour zoomer" : "Carte du monde"}
        >
          <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
            <rect x={0} y={0} width={size.width} height={size.height} className="eg-map-ocean" />
            {WORLD_COUNTRY_FEATURES.features.map((feature, index) => (
              <path
                key={feature.id !== undefined ? String(feature.id) : `country-${index}`}
                d={path(feature) ?? undefined}
                className="eg-map-country"
                vectorEffect="non-scaling-stroke"
                data-highlighted={feature.id !== undefined && String(feature.id) === highlightCountryId}
              />
            ))}
            {projectedMarkers.length === 2 ? (
              <line
                x1={projectedMarkers[0]!.x}
                y1={projectedMarkers[0]!.y}
                x2={projectedMarkers[1]!.x}
                y2={projectedMarkers[1]!.y}
                className="eg-map-line"
                vectorEffect="non-scaling-stroke"
              />
            ) : null}
            {projectedMarkers.map((marker, index) => (
              <g
                key={index}
                transform={`translate(${marker.x} ${marker.y}) scale(${1 / zoom})`}
                className={`eg-map-pin eg-map-pin--${marker.kind}`}
              >
                <circle r="10" className="eg-map-pin-halo" />
                <circle r="6" className="eg-map-pin-dot" />
              </g>
            ))}
          </g>
        </svg>
      ) : null}
      {zoom > MIN_ZOOM ? (
        <button type="button" className="eg-map-reset" onClick={resetView} aria-label="Réinitialiser le zoom">
          <span aria-hidden="true">⤢</span>
        </button>
      ) : null}
    </div>
  );
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
