import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoEtps, DEMO_USERS, DEMO_AGENCY } from '../../src/demo/seed.ts';

test('dois ETPs fictícios, um em andamento e um concluído', () => {
  const etps = buildDemoEtps();
  assert.equal(etps.length, 2);
  assert.deepEqual(etps.map(e => e.status).sort(), ['completed', 'in_progress']);
  assert.ok(etps.every(e => e.data.etp_name.length > 20));
  assert.ok(etps.every(e => e.data.diag_problema_necessidade.length > 60));
  assert.ok(etps.every(e => e.data.objeto_sucinto.length > 20));
  assert.ok(etps.every(e => e.userEmail.endsWith('@exemplo.gov.br')));
});

test('três usuários fictícios, sem e-mail de órgão real', () => {
  assert.equal(DEMO_USERS.length, 3);
  assert.ok(DEMO_USERS.every(u => u.email.endsWith('@exemplo.gov.br')));
  assert.equal(DEMO_USERS.filter(u => u.status === 'pending').length, 1);
  assert.equal(DEMO_USERS.filter(u => u.role === 'master').length, 1);
});

test('órgão fictício não usa nome real', () => {
  assert.equal(DEMO_AGENCY.name, 'Órgão Público Exemplo');
  assert.equal(DEMO_AGENCY.logoUrl, '');
});