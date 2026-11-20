import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePairingCode, acceptPairingCode, cleanCode } from '../src/pairing.mjs';

test('pairing codes are always six digits including leading zeros',()=>{
  const crypto={getRandomValues(values){values[0]=42;}};
  assert.equal(generatePairingCode('',crypto),'000042');
  for(let i=0;i<100;i++) assert.match(generatePairingCode(),/^\d{6}$/);
});
test('refresh cannot reuse the previous code',()=>{
  let n=0;const crypto={getRandomValues(values){values[0]=n++===0?123456:654321;}};
  assert.equal(generatePairingCode('123456',crypto),'654321');
});
test('preview accepts arbitrary six-digit codes and rejects incomplete input',()=>{
  assert.equal(acceptPairingCode('000000'),true);
  assert.equal(acceptPairingCode('987654'),true);
  assert.equal(acceptPairingCode('123 456'),true);
  for(const code of ['', '12345','1234567','abcdef'])assert.equal(acceptPairingCode(code),false);
  assert.equal(cleanCode('12a 345678'),'123456');
});
