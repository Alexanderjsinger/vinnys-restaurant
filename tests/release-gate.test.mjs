import test from 'node:test';
import assert from 'node:assert/strict';
import { assertCheckResults, REQUIRED_CHECKS } from '../scripts/assert-check-results.mjs';

const passing = () => Object.fromEntries(REQUIRED_CHECKS.map(name => [name, { result: 'success' }]));

test('release gate accepts only a complete set of successful required checks', () => {
  assert.doesNotThrow(() => assertCheckResults(passing()));
  for (const name of REQUIRED_CHECKS) {
    const results = passing();
    delete results[name];
    assert.throws(() => assertCheckResults(results), /Release blocked/);
    for (const result of ['failure', 'cancelled', 'skipped', 'neutral', 'pending', undefined]) {
      results[name] = { result };
      assert.throws(() => assertCheckResults(results), /Release blocked/);
    }
  }
});

test('release gate rejects missing and malformed result objects', () => {
  for (const value of [undefined, null, [], 'success', {}]) {
    assert.throws(() => assertCheckResults(value));
  }
});

const { assertCleanSarif } = await import('../scripts/check-sarif.mjs');
const clean = () => ({ version: '2.1.0', runs: [{ tool: { driver: { name: 'CodeQL' } }, results: [] }] });

test('code-scanning gate fails on missing reports, missing results, findings and failed scanner execution', () => {
  assert.doesNotThrow(() => assertCleanSarif([clean()]));
  for (const value of [[], [null], [{}], [{ version: '2.1.0', runs: [] }]]) {
    assert.throws(() => assertCleanSarif(value));
  }
  const missing = clean(); delete missing.runs[0].results;
  assert.throws(() => assertCleanSarif([missing]));
  const finding = clean(); finding.runs[0].results.push({ ruleId: 'test' });
  assert.throws(() => assertCleanSarif([finding]), /Release blocked/);
  const failed = clean(); failed.runs[0].invocations = [{ executionSuccessful: false }];
  assert.throws(() => assertCleanSarif([failed]), /Scanner execution failed/);
});


const { assessPolicyPr } = await import('../scripts/check-policy-pr.mjs');
const pr = () => ({ number: 57, state: 'OPEN', isDraft: false, baseRefName: 'codex/alternative-homepage', headRefName: 'codex/solo-owner-review-policy', headRefOid: 'a'.repeat(40), comments: [{ author: { login: 'Alexanderjsinger' }, body: `Reviewed ${'a'.repeat(40)}`, url: 'https://github.com/example/review' }], statusCheckRollup: [{ name: 'check', status: 'COMPLETED', conclusion: 'SUCCESS' }] });
test('PR preflight rejects stale and non-owner review comments', () => {
  assert.deepEqual(assessPolicyPr(pr()).blockers, []);
  for (const mutate of [p => p.comments[0].body = `Reviewed ${'b'.repeat(40)}`, p => p.comments[0].author.login = 'other', p => p.comments = []]) {
    const value = pr(); mutate(value);
    assert.ok(assessPolicyPr(value).blockers.some(x => x.includes('owner Reviewed')));
  }
});
test('PR preflight rejects missing, skipped and pending checks and draft PRs', () => {
  for (const mutate of [p => p.statusCheckRollup = [], p => p.statusCheckRollup[0].conclusion = 'SKIPPED', p => p.statusCheckRollup[0].status = 'IN_PROGRESS', p => p.isDraft = true]) {
    const value = pr(); mutate(value); assert.ok(assessPolicyPr(value).blockers.length > 0);
  }
});

const { assessFinalPolicySnapshot } = await import('../scripts/check-policy-pr.mjs');
const snapshot = () => ({ state: 'open', draft: false, mergeable: true, mergeable_state: 'clean', head: { sha: 'a'.repeat(40), ref: 'codex/solo-owner-review-policy', repo: { full_name: 'Alexanderjsinger/vinnys-restaurant' } }, base: { sha: 'b'.repeat(40), ref: 'codex/alternative-homepage', repo: { full_name: 'Alexanderjsinger/vinnys-restaurant' } } });
const expected = () => ({ ...pr(), baseRefOid: 'b'.repeat(40) });
const timing = { headPushAt: '2026-11-17T12:00:00Z', commentCreatedAt: '2026-11-17T12:01:00Z' };
test('final PR check rejects changed base/head/repository/state even with same head SHA', () => {
  assert.deepEqual(assessFinalPolicySnapshot(expected(), snapshot(), timing), []);
  for (const mutate of [p => p.base.ref = 'main', p => p.base.sha = 'c'.repeat(40), p => p.head.ref = 'other', p => p.head.repo.full_name = 'other/fork', p => p.state = 'closed', p => p.draft = true]) {
    const value = snapshot(); mutate(value); assert.ok(assessFinalPolicySnapshot(expected(), value, timing).length);
  }
});
test('declared commit time cannot substitute for missing or newer server-side push evidence', () => {
  assert.ok(assessFinalPolicySnapshot(expected(), snapshot(), { commentCreatedAt: timing.commentCreatedAt }).some(x => x.includes('trusted branch-specific')));
  assert.ok(assessFinalPolicySnapshot(expected(), snapshot(), { ...timing, headPushAt: '2026-11-17T12:02:00Z' }).some(x => x.includes('latest verified head push')));
});

test('SARIF CLI annotations expose failure categories without report contents', async () => {
  const { mkdtempSync, writeFileSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const directory = mkdtempSync(join(tmpdir(), 'sarif-gate-'));
  try {
    for (const report of ['PRIVATE_TEST_MARKER malformed JSON', JSON.stringify({ version: '2.1.0', runs: [{ tool: { driver: { name: 'CodeQL' } }, results: [{ message: { text: 'PRIVATE_TEST_MARKER' } }] }] })]) {
      writeFileSync(join(directory, 'test.sarif'), report);
      const result = spawnSync(process.execPath, ['scripts/check-sarif.mjs', directory], { encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'true' } });
      assert.equal(result.status, 1);
      assert.match(result.stderr, /::error::/);
      assert.doesNotMatch(result.stderr, /PRIVATE_TEST_MARKER/);
    }
  } finally { rmSync(directory, { recursive: true, force: true }); }
});
