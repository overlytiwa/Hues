import { useEffect, useRef, useState } from 'react';
import PhoneScene from './PhoneScene.jsx';
import Icon from './Icon.jsx';
import { generatePairingCode, acceptPairingCode, cleanCode } from './pairing.mjs';

function Modal({ children, title, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    (dialog.current.querySelector('input') || dialog.current.querySelector('[data-autofocus]') || dialog.current.querySelector('button'))?.focus();
    const trap = (event) => {
      if (event.key !== 'Tab') return;
      const items = [...dialog.current.querySelectorAll('button:not(:disabled), input, a[href]')];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1]?.focus(); }
      else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0]?.focus(); }
    };
    document.addEventListener('keydown', trap);
    return () => { document.removeEventListener('keydown', trap); previous?.focus(); };
  }, [title]);
  return <div className="modal-backdrop" onClick={onClose}>
    <section ref={dialog} className="modal" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={event => event.stopPropagation()}>
      <button className="close-button" aria-label="Close" onClick={onClose}><Icon name="close" /></button>
      <h2 id="dialog-title">{title}</h2>
      {children}
    </section>
  </div>;
}

export default function App() {
  const [code, setCode] = useState(generatePairingCode);
  const [dialog, setDialog] = useState(null);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState('');
  const timer = useRef(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    const handleRemote = event => {
      const key = event.key;
      if (key === 'Escape' || event.keyCode === 10009) {
        event.preventDefault();
        if (dialog) setDialog(null);
        else if (window.tizen) setDialog('exit');
        return;
      }
      const direction = ['ArrowLeft', 'ArrowUp', 'ArrowRight', 'ArrowDown'].includes(key)
        ? key : ({ 37: 'ArrowLeft', 38: 'ArrowUp', 39: 'ArrowRight', 40: 'ArrowDown' })[event.keyCode];
      if (!direction) return;
      if (document.activeElement?.tagName === 'INPUT' && ['ArrowLeft', 'ArrowRight'].includes(direction)) return;
      const scope = document.querySelector('[role="dialog"]') || document.querySelector('main');
      const buttons = [...scope.querySelectorAll('button:not(:disabled), input, a[href]')].filter(node => node.tabIndex >= 0 && node.getClientRects().length);
      if (!buttons.length) return;
      event.preventDefault();
      const current = buttons.indexOf(document.activeElement);
      const step = ['ArrowRight', 'ArrowDown'].includes(direction) ? 1 : -1;
      buttons[(current + step + buttons.length) % buttons.length]?.focus();
    };
    document.addEventListener('keydown', handleRemote);
    return () => document.removeEventListener('keydown', handleRemote);
  }, [dialog]);

  const newCode = () => {
    setCode(previous => generatePairingCode(previous));
    setToast('Your new code is ready');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(''), 2400);
  };
  const openPreview = () => { setInput(''); setDialog('pair'); };
  const submit = event => {
    event.preventDefault();
    if (acceptPairingCode(input)) { setDialog(null); setConnected(true); }
  };

  return <div className="app-shell">
    <header className="topbar">
      <a className="wordmark" href="./" aria-label="Heus home">Heus<span className="brand-dot">.</span></a>
      <span className="tv-label"><Icon name="tv" size={20} /> <span>HEUS FOR TV</span></span>
    </header>

    <main className={`pairing-layout ${connected ? 'is-connected' : ''}`}>
      <div className="visual-column">
        <PhoneScene connected={connected} onPair={openPreview} />
      </div>
      <section className="instructions" aria-labelledby="pairing-title">
        <div className="eyebrow">{connected ? 'ALL SET' : 'YOUR SPACE, REIMAGINED'}</div>
        <h1 id="pairing-title">{connected ? <>Right at<br />home.</> : <>Make yourself<br />at home.</>}</h1>
        <p className="intro">{connected ? 'Your phone and TV are perfectly paired.' : 'A new mood for your TV. It starts with your phone.'}</p>

        {connected ? <div className="success-content">
          <div className="success-symbol"><Icon name="check" size={34} /></div>
          <div><h2>You’re connected</h2><p>Choose a look on your phone.<br />Make the big screen yours.</p></div>
        </div> : <>
          <ol className="steps">
            <li><span className="step-number">1</span><span>Open <strong>Heus</strong> on your phone.</span></li>
            <li><span className="step-number">2</span><span>Tap <strong>Pair a TV</strong>, then enter this code.</span></li>
          </ol>
          <div className="code-block">
            <p className="code-label" id="code-label">YOUR PAIRING CODE</p>
            <div className="code-digits" role="status" aria-live="polite" aria-atomic="true" aria-label={`Pairing code ${code.split('').join(' ')}`}>
              {code.split('').map((digit, index) => <span key={index} className={`digit ${index === 3 ? 'digit-group' : ''}`} aria-hidden="true">{digit}</span>)}
            </div>
            <p className="waiting"><span className="waiting-indicator" aria-hidden="true" />Waiting for your phone</p>
          </div>
        </>}

        <div className="actions">
          {connected ? <button className="action-button" onClick={() => { setConnected(false); newCode(); }}><Icon name="link" size={18} />Pair another phone</button> : <button className="action-button" onClick={newCode}><Icon name="refresh" size={18} />New code</button>}
          <button className="text-button" onClick={() => setDialog('help')}><Icon name="help" size={18} />Need help?</button>
        </div>
      </section>
    </main>

    <footer className="footer"><span>A little connection. A whole new atmosphere.</span><span className="footer-right"><Icon name="phone" size={16} /> Made to work together</span></footer>
    <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">{toast}</div>

    {dialog === 'help' && <Modal title="Let’s get you paired" onClose={() => setDialog(null)}>
      <p>Open Heus on your phone and tap <strong>Pair a TV</strong>. Enter the six-digit code displayed on this screen.</p>
      <p>Need a fresh start? Choose <strong>New code</strong> on your TV and try again.</p>
      <div className="preview-note"><span>Explore the pairing experience</span><small>This preview accepts any six-digit code.</small></div>
      <button className="primary-button" onClick={openPreview}>Try pairing preview</button>
    </Modal>}
    {dialog === 'pair' && <Modal title="Pair your TV" onClose={() => setDialog(null)}>
      <p>Enter the six-digit code shown on your TV.</p>
      <form onSubmit={submit}>
        <label className="input-label" htmlFor="pair-code">Pairing code</label>
        <input id="pair-code" className="pair-input" type="text" inputMode="numeric" autoComplete="off" maxLength={9} placeholder="000 000" value={input} onChange={event => setInput(cleanCode(event.target.value))} aria-describedby="preview-hint" required pattern="[0-9]{6}" />
        <p id="preview-hint" className="input-hint">Preview mode · Any six-digit code works.</p>
        <button className="primary-button" type="submit" disabled={!acceptPairingCode(input)}>Pair TV</button>
      </form>
    </Modal>}
    {dialog === 'exit' && <Modal title="Leave Heus?" onClose={() => setDialog(null)}><p>You can come back and pair your phone anytime.</p><button className="primary-button" onClick={() => setDialog(null)}>Stay here</button><button className="text-button exit-button" onClick={() => { try { window.tizen.application.getCurrentApplication().exit(); } catch { setDialog(null); } }}>Exit Heus</button></Modal>}
  </div>;
}
