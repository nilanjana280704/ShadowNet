/**
 * NetworkGraph — an animated live mesh visualization: the current device at the
 * center, nearby nodes around it, links with a flowing "signal" animation, node
 * pulses, and a slow radar sweep. Presentational; feed it mock or real node
 * data. Self-measuring — fills its container.
 *
 * @param {object} props
 * @param {Array<{id:string,label?:string,angle:number,dist:number,level?:number,transport?:string}>} props.nodes
 *        angle 0..1 (fraction of a full turn), dist 0..1 (fraction of radius)
 * @param {Array<[number,number]>} [props.links] inter-node links by index
 * @param {string} [props.centerLabel='You']
 */
import React, { useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors, radius } from '../../theme';
import { usePulse, useRadarSweep, useRouteAnimation } from '../../animations';
import { Text } from '../atoms';

const AnimatedLine = Animated.createAnimatedComponent(Line);

function nodeColor(level = 3) {
  return colors.signal[Math.max(0, Math.min(colors.signal.length - 1, level - 1))];
}

/** A single node dot with a breathing halo and label. */
function NodeBlip({ x, y, color, label, size = 12 }) {
  const pulse = usePulse();
  return (
    <View pointerEvents="none" style={[styles.blip, { left: x - 20, top: y - 20 }]}>
      <Animated.View
        style={[styles.halo, { width: size * 2.4, height: size * 2.4, backgroundColor: color }, pulse]}
      />
      <View style={[styles.dot, { width: size, height: size, backgroundColor: color }]} />
      {label ? (
        <Text variant="telemetrySmall" color="secondary" style={styles.blipLabel} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

function NetworkGraph({ nodes = [], links = [], centerLabel = 'You' }) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const flow = useRouteAnimation();
  const sweep = useRadarSweep();
  const centerPulse = usePulse();

  const cx = size.w / 2;
  const cy = size.h / 2;
  const maxR = Math.min(size.w, size.h) / 2 - 28;

  const positioned = nodes.map((n) => {
    const theta = n.angle * Math.PI * 2;
    return {
      ...n,
      x: cx + Math.cos(theta) * n.dist * maxR,
      y: cy + Math.sin(theta) * n.dist * maxR,
      color: nodeColor(n.level),
    };
  });

  const dashOffset = flow.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  const ready = size.w > 0 && size.h > 0;

  return (
    <View
      style={styles.container}
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
    >
      {ready ? (
        <>
          <Svg width={size.w} height={size.h} style={StyleSheet.absoluteFill}>
            {/* Range rings */}
            {[1, 0.66, 0.33].map((f) => (
              <Circle key={f} cx={cx} cy={cy} r={maxR * f} stroke={colors.border} strokeWidth={1} fill="none" />
            ))}
            {/* Inter-node links (static, faint) */}
            {links.map(([a, b], i) => {
              const p1 = positioned[a];
              const p2 = positioned[b];
              if (!p1 || !p2) return null;
              return (
                <Line
                  key={`ln-${i}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={colors.secondary}
                  strokeOpacity={0.18}
                  strokeWidth={1.5}
                />
              );
            })}
            {/* Center -> node links with flowing signal */}
            {positioned.map((n) => (
              <AnimatedLine
                key={`link-${n.id}`}
                x1={cx}
                y1={cy}
                x2={n.x}
                y2={n.y}
                stroke={n.color}
                strokeOpacity={0.5}
                strokeWidth={1.5}
                strokeDasharray={[5, 9]}
                strokeDashoffset={dashOffset}
              />
            ))}
          </Svg>

          {/* Radar sweep overlay */}
          <Animated.View style={[styles.sweepWrap, sweep]} pointerEvents="none">
            <Svg width={size.w} height={size.h}>
              <Line x1={cx} y1={cy} x2={cx} y2={cy - maxR} stroke={colors.secondary} strokeWidth={2} strokeOpacity={0.5} />
            </Svg>
          </Animated.View>

          {/* Nodes */}
          {positioned.map((n) => (
            <NodeBlip key={n.id} x={n.x} y={n.y} color={n.color} label={n.label} />
          ))}

          {/* Center device */}
          <View pointerEvents="none" style={[styles.center, { left: cx - 26, top: cy - 26 }]}>
            <Animated.View style={[styles.centerHalo, centerPulse]} />
            <View style={styles.centerDot} />
            <Text variant="telemetrySmall" color="accent" style={styles.centerLabel}>
              {centerLabel}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 260, overflow: 'hidden' },
  sweepWrap: { ...StyleSheet.absoluteFillObject },
  blip: { position: 'absolute', width: 40, alignItems: 'center', justifyContent: 'center' },
  halo: { position: 'absolute', borderRadius: radius.circle, opacity: 0.25 },
  dot: { borderRadius: radius.circle },
  blipLabel: { position: 'absolute', top: 26, width: 72, textAlign: 'center' },
  center: { position: 'absolute', width: 52, height: 52, alignItems: 'center', justifyContent: 'center' },
  centerHalo: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    opacity: 0.25,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: radius.circle,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  centerLabel: { position: 'absolute', top: 40 },
});

export default NetworkGraph;
