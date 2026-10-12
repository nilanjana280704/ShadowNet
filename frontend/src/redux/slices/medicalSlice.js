/**
 * medicalSlice — normalized medical camps (relief network).
 */
import { createEntitySlice } from './entitySliceFactory';

const slice = createEntitySlice('medical');

export const { seeded: medicalSeeded, upserted: medicalUpserted } = slice.actions;
export default slice.reducer;
