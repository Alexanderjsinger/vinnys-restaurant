import { pathToFileURL } from 'node:url';

export const REQUIRED_CHECKS = Object.freeze(['check', 'dependency-audit', 'secret-scan', 'codeql', 'workflow-lint']);

export function assertCheckResults(results) {
  if (!results || typeof results !== 'object' || Array.isArray(results)) {
    throw new Error('Required check results must be an object.');
  }
  const failures = REQUIRED_CHECKS.filter(name => results[name]?.result !== 'success');
  if (failures.length) throw new Error(`Release blocked: missing or unsuccessful checks: ${failures.join(', ')}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    assertCheckResults(JSON.parse(process.env.CHECK_RESULTS ?? '{}'));
    console.log('PASS: every required check succeeded.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
