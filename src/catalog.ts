export const ADD_ONS = [
  ['window-tracks', 'Window Tracks & Sills'],
  ['baseboards', 'Baseboards'],
  ['doors', 'Doors & Door Frames'],
  ['cabinet-fronts', 'Cabinet Fronts'],
  ['shower-tub', 'Detailed Shower & Tub Cleaning'],
  ['trash-cans', 'Trash Can Cleaning & Sanitizing'],
  ['bed-making', 'Bed Making'],
  ['laundry', 'Laundry — Wash, Dry & Fold'],
  ['pet-hair', 'Pet Hair Removal from Furniture & Upholstery'],
  ['wall-spots', 'Wall Spot Cleaning'],
  ['cobwebs', 'Cobweb Removal'],
  ['floor-edges', 'Detailed Floor Edges & Corners'],
  ['high-areas', 'High & Hard-to-Reach Areas'],
];
export const FREQUENCIES = [
  ['one-time', 'One-Time'],
  ['weekly', 'Weekly'],
  ['every-2-weeks', 'Every 2 Weeks'],
  ['every-3-weeks', 'Every 3 Weeks'],
  ['monthly', 'Monthly'],
  ['not-sure-yet', 'Not Sure Yet'],
];
export const RECURRING_FREQUENCIES = FREQUENCIES.filter(([value]) =>
  ['weekly', 'every-2-weeks', 'every-3-weeks', 'monthly'].includes(value),
);
export const FREQUENCY_PRICES: Record<string, string> = {
  weekly: 'Base Rate',
  'every-2-weeks': 'Base + $5',
  'every-3-weeks': 'Individually quoted',
  monthly: 'Base + $10',
};
