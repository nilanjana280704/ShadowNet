/**
 * ShadowNet — Component library entry point.
 *
 * Organized by Atomic Design:
 *   atoms/      indivisible primitives (Text, Icon, Button, indicators…)
 *   molecules/  small compositions (Cards, TextField, ListItem, states…)
 *   organisms/  complex blocks (Modal, BottomSheet)
 *   layout/     screen scaffolding (ScreenWrapper, GradientContainer…)
 *   dashboard/  command-center widgets
 *   map/        map markers & overlays
 *
 * Import from the top level:
 *   import { Button, MetricCard, ScreenWrapper } from 'src/components';
 */
export * from './atoms';
export * from './molecules';
export * from './organisms';
export * from './layout';
export * from './dashboard';
export * from './map';
