export default function PhoneScene({ connected, onPair }) {
  return <div className="scene-container" role="img" aria-label="A custom 3D hand holding an upright phone. The Heus phone app shows the Pair a TV button.">
    <img className="hand-artwork" src="./assets/heus-hand-phone.png" alt="" width="1100" height="1350" draggable="false" />
    <button className="scene-pair-hotspot" tabIndex={-1} aria-label="Preview pairing on the phone" onClick={onPair} disabled={connected} />
  </div>;
}
