import { collectAndSummarizeGeneralNews } from './server/services/generalNewsService.ts';

console.log('[Manual Collection] Starting general news collection...');

try {
  await collectAndSummarizeGeneralNews();
  console.log('[Manual Collection] Completed successfully');
  process.exit(0);
} catch (error) {
  console.error('[Manual Collection] Error:', error);
  process.exit(1);
}
