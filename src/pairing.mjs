// This prototype intentionally accepts any six-digit code, as requested.
// Replace acceptPairingCode with a server handshake when adding real devices.
export function acceptPairingCode(value) {
  return /^\d{6}$/.test(String(value).replace(/\s/g, ''));
}

export function generatePairingCode(previous = '', cryptoApi = globalThis.crypto) {
  const bytes = new Uint32Array(1);
  let code;
  do {
    if (cryptoApi?.getRandomValues) {
      cryptoApi.getRandomValues(bytes);
      code = String(bytes[0] % 1000000).padStart(6, '0');
    } else {
      code = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    }
  } while (code === previous);
  return code;
}

export function cleanCode(value) {
  return value.replace(/\D/g, '').slice(0, 6);
}
