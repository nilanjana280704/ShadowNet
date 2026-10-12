/**
 * MapCanvas — the offline map surface. A vector-drawn local area (grid, roads,
 * river) with danger zones, communication coverage, an animated route, entity
 * markers, and the pulsing user position — all projected from geo coordinates
 * by MapsService. Inherently offline; a real OSM tile layer can replace the
 * base drawing without touching markers/overlays (they consume the same
 * projection).
 *
 * @param {object} props
 * @param {Array} props.entities entities to plot (already layer-filtered)
 * @param {{lat,lng}} props.center map center
 * @param {number} [props.spanM=3200] meters across the canvas width (zoom)
 * @param {string} [props.selectedId]
 * @param {object} [props.route] active route { points: geo[] }
 * @param {Array} [props.dangerZones] zone entities (drawn even when unselected)
 * @param {number} [props.coverageM] communication coverage radius around user
 * @param {{lat,lng}} props.userGeo
 * @param {(id:string) => void} props.onSelect
 * @param {() => void} [props.onPressBackground]
 */
import React, { useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Line, Pattern, Polygon, Polyline, Rect } from 'react-native-svg';

import { colors, radius } from '../../../theme';
import { usePulse } from '../../../animations';
import { RouteLine } from '../../../components';
import { baseMapGeometry } from '../mockData';
import { MapsService } from '../services';
import MapMarker from './MapMarker';

const MARKER_HALF = 17; // half of the marker wrap footprint

function MapCanvas({
  entities = [],
  center,
  spanM = 3200,
  selectedId,
  route,
  dangerZones = [],
  coverageM = 0,
  userGeo,
  onSelect,
  onPressBackground,
}) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const userPulse = usePulse();
  const ready = size.w > 0 && size.h > 0;

  const project = (geo) => MapsService.project(geo, center, size, spanM);
  const toPx = (m) => MapsService.metersToPx(m, size, spanM);

  // Cheap enough to project per render (a handful of points).
  const roads = ready ? baseMapGeometry.roads.map((seg) => seg.map(project)) : [];
  const river = ready ? baseMapGeometry.river.map(project) : [];

  const inBounds = ({ x, y }) => x > -40 && y > -40 && x < size.w + 40 && y < size.h + 40;
  const userPx = ready ? project(userGeo) : { x: 0, y: 0 };
  const routePx = ready && route ? route.points.map(project) : null;

  return (
    <View style={styles.canvas} onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {ready ? (
        <>
          <Pressable style={StyleSheet.absoluteFill} onPress={onPressBackground} accessibilityLabel="Map background">
            <Svg width={size.w} height={size.h}>
              <Defs>
                <Pattern id="sn-map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
                  <Line x1="0" y1="0" x2="48" y2="0" stroke={colors.border} strokeWidth="1" />
                  <Line x1="0" y1="0" x2="0" y2="48" stroke={colors.border} strokeWidth="1" />
                </Pattern>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill={colors.backgroundAlt} />
              <Rect x="0" y="0" width="100%" height="100%" fill="url(#sn-map-grid)" />

              {/* River */}
              {river.length > 1 ? (
                <Polygon
                  points={[...river, { x: river[river.length - 1].x, y: river[river.length - 1].y + toPx(260) }, { x: river[0].x, y: river[0].y + toPx(260) }]
                    .map((p) => `${p.x},${p.y}`)
                    .join(' ')}
                  fill={colors.overlay.secondary08}
                  stroke={colors.tint.infoBorder}
                  strokeWidth={1}
                />
              ) : null}

              {/* Roads */}
              {roads.map((seg, i) => (
                <Polyline
                  key={`road-${i}`}
                  points={seg.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={colors.borderStrong}
                  strokeWidth={i === 0 ? 6 : 4}
                  strokeLinecap="round"
                />
              ))}

              {/* Communication coverage around the user */}
              {coverageM > 0 ? (
                <Circle
                  cx={userPx.x}
                  cy={userPx.y}
                  r={toPx(coverageM)}
                  fill={colors.overlay.primary08}
                  stroke={colors.borderAccent}
                  strokeWidth={1}
                  strokeDasharray="6 6"
                />
              ) : null}

              {/* Danger zones + blocked roads */}
              {dangerZones.map((zone) => {
                const p = project(zone.geo);
                if (zone.danger?.kind === 'road' && zone.danger.end) {
                  const e = project(zone.danger.end);
                  return (
                    <Line
                      key={zone.id}
                      x1={p.x}
                      y1={p.y}
                      x2={e.x}
                      y2={e.y}
                      stroke={colors.critical}
                      strokeWidth={5}
                      strokeDasharray="10 8"
                      strokeLinecap="round"
                      opacity={0.75}
                    />
                  );
                }
                return (
                  <Circle
                    key={zone.id}
                    cx={p.x}
                    cy={p.y}
                    r={toPx(zone.danger?.radiusM ?? 150)}
                    fill={colors.tint.criticalBg}
                    stroke={colors.tint.criticalBorder}
                    strokeWidth={1.5}
                  />
                );
              })}
            </Svg>
          </Pressable>

          {/* Active route (animated dash flow) */}
          {routePx ? (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <RouteLine points={routePx} width={size.w} height={size.h} tone="navigation" />
            </View>
          ) : null}

          {/* Entity markers */}
          {entities.map((entity) => {
            const p = project(entity.geo);
            if (!inBounds(p)) return null;
            return (
              <View key={entity.id} style={[styles.markerAt, { left: p.x - MARKER_HALF, top: p.y - MARKER_HALF }]}>
                <MapMarker entity={entity} selected={entity.id === selectedId} onPress={onSelect} />
              </View>
            );
          })}

          {/* User position */}
          <View style={[styles.userAt, { left: userPx.x - 22, top: userPx.y - 22 }]} pointerEvents="none">
            <Animated.View style={[styles.userHalo, userPulse]} />
            <View style={styles.userDot} />
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: { flex: 1, overflow: 'hidden', backgroundColor: colors.backgroundAlt },
  markerAt: { position: 'absolute', width: MARKER_HALF * 2, height: MARKER_HALF * 2, alignItems: 'center', justifyContent: 'center' },
  userAt: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  userHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    opacity: 0.25,
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.background,
  },
});

export default MapCanvas;
