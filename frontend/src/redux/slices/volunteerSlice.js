/**
 * volunteerSlice — normalized relief-network volunteers.
 */
import { createEntitySlice } from './entitySliceFactory';

const slice = createEntitySlice('volunteer');

export const { seeded: volunteersSeeded, upserted: volunteerUpserted } = slice.actions;
export default slice.reducer;
