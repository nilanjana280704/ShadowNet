/**
 * shelterSlice — normalized shelters (relief network).
 */
import { createEntitySlice } from './entitySliceFactory';

const slice = createEntitySlice('shelter');

export const { seeded: sheltersSeeded, upserted: shelterUpserted } = slice.actions;
export default slice.reducer;
