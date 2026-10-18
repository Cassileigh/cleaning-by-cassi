import {
  inventory as sharedInventory,
  runInventoryCli,
} from './reference-history.mjs';

const options = {
  referenceRepository: 'AlienX420710/alienx-smarthome',
  referenceTitle: 'AlienX',
  siteTitle: 'Cleaning by Cassi',
  requestContract: 'quote-security-contract.md',
  wrapper: 'compare-reference-history.mjs',
  outputFile: 'alienx-commit-inventory.md',
  mirrorName: 'alienx-reference.git',
  defaultDate: true,
};

export const inventory = (reference, date) =>
  sharedInventory(reference, date, options);
await runInventoryCli(import.meta.url, options);
