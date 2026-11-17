import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function assertCleanSarif(reports) {
  if (!Array.isArray(reports) || reports.length === 0) throw new Error('Missing code-scanning reports.');
  let findings = 0;
  for (const report of reports) {
    if (report.version !== '2.1.0' || !Array.isArray(report.runs) || report.runs.length === 0) {
      throw new Error('Malformed or empty code-scanning report.');
    }
    for (const run of report.runs) {
      if (!run.tool?.driver?.name || !Array.isArray(run.results)) throw new Error('Missing scanner identity or results.');
      if (run.invocations?.some(invocation => invocation.executionSuccessful === false)) throw new Error('Scanner execution failed.');
      findings += run.results.length;
    }
  }
  if (findings) throw new Error(`Release blocked: ${findings} code-scanning finding(s). Review scanner results; raw evidence is not printed here.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const directory = process.argv[2];
    if (!directory) throw new Error('A SARIF output directory is required.');
    const files = fs.readdirSync(directory, { recursive: true }).filter(file => file.endsWith('.sarif'));
    assertCleanSarif(files.map(file => JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'))));
    console.log('PASS: scanner reports exist and contain no findings.');
  } catch (error) {
    console.error(error instanceof SyntaxError ? 'Malformed SARIF JSON report; raw contents withheld.' : error.message);
    process.exitCode = 1;
  }
}
