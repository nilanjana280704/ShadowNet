/**
 * dangerZoneSlice — normalized danger zones and blocked roads.
 */
import { createEntitySlice } from './entitySliceFactory';

const slice = createEntitySlice('dangerZone');

export const { seeded: dangerZonesSeeded, upserted: dangerZoneUpserted } = slice.actions;
export default slice.reducer;
