'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { CircleHelp, Info, Pause, Play, Rotate3D, Sparkles } from 'lucide-react';
import styles from './biology-lab.module.css';

type LabExample = 'water' | 'digestion';

type Organ = {
  id: string;
  label: string;
  short: string;
  detail: string;
  color: string;
};

const organs: Organ[] = [
  { id: 'mouth', label: 'Mouth', short: 'Chews food and mixes it with saliva.', detail: 'Digestion begins here. Teeth break food into smaller pieces while saliva starts breaking down starch.', color: '#f6b7a7' },
  { id: 'oesophagus', label: 'Oesophagus', short: 'Moves the bolus to the stomach.', detail: 'Muscular walls use rhythmic contractions called peristalsis to push food downwards.', color: '#f6d2a7' },
  { id: 'stomach', label: 'Stomach', short: 'Churns food with acidic juice.', detail: 'The stomach stores and mixes food. Acid and enzymes begin protein digestion.', color: '#df8c8c' },
  { id: 'liver', label: 'Liver', short: 'Makes bile for fat digestion.', detail: 'Bile made by the liver helps emulsify fats into smaller droplets.', color: '#c89055' },
  { id: 'pancreas', label: 'Pancreas', short: 'Releases digestive enzymes.', detail: 'The pancreas sends enzymes into the small intestine to digest carbohydrates, proteins and fats.', color: '#e7b568' },
  { id: 'small-intestine', label: 'Small intestine', short: 'Absorbs most digested nutrients.', detail: 'Villi increase the surface area so useful nutrients can pass into the blood.', color: '#e58b91' },
  { id: 'large-intestine', label: 'Large intestine', short: 'Absorbs water and forms faeces.', detail: 'Water and some salts are absorbed here before waste is stored in the rectum.', color: '#b96973' },
];

function useOrbit() {
  const [rotation, setRotation] = useState({ x: -7, y: 18 });
  const [dragging, setDragging] = useState(false);
  const origin = useRef({ x: 0, y: 0, rx: 0, ry: 0 });

  function start(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    origin.current = { x: event.clientX, y: event.clientY, rx: rotation.x, ry: rotation.y };
    setDragging(true);
  }
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setRotation({
      x: Math.max(-45, Math.min(45, origin.current.rx - (event.clientY - origin.current.y) * 0.35)),
      y: origin.current.ry + (event.clientX - origin.current.x) * 0.45,
    });
  }
  function end() { setDragging(false); }

  return { rotation, dragging, start, move, end, reset: () => setRotation({ x: -7, y: 18 }) };
}

function WaterMolecule() {
  const orbit = useOrbit();
  return (
    <div className={styles.modelStage}>
      <div
        className={`${styles.orbitCanvas} ${orbit.dragging ? styles.dragging : ''}`}
        onPointerDown={orbit.start}
        onPointerMove={orbit.move}
        onPointerUp={orbit.end}
        onPointerCancel={orbit.end}
        style={{ transform: `perspective(800px) rotateX(${orbit.rotation.x}deg) rotateY(${orbit.rotation.y}deg)` }}
        role="img"
        aria-label="Interactive 3D model of a water molecule"
      >
        <div className={`${styles.bond} ${styles.bondLeft}`} />
        <div className={`${styles.bond} ${styles.bondRight}`} />
        <div className={`${styles.atom} ${styles.oxygen}`}><strong>O</strong><span>Oxygen</span></div>
        <div className={`${styles.atom} ${styles.hydrogenLeft}`}><strong>H</strong><span>Hydrogen</span></div>
        <div className={`${styles.atom} ${styles.hydrogenRight}`}><strong>H</strong><span>Hydrogen</span></div>
        <div className={styles.angleArc} aria-hidden="true"><span>104.5°</span></div>
      </div>
      <div className={styles.modelHint}><Rotate3D size={15} /> Drag to orbit · scroll to zoom</div>
      <div className={styles.modelLegend}><span><i className={styles.oxygenDot} /> Oxygen</span><span><i className={styles.hydrogenDot} /> Hydrogen</span></div>
      <button className={styles.resetOrbit} type="button" onClick={orbit.reset}>Reset view</button>
    </div>
  );
}

function DigestiveSystem() {
  const orbit = useOrbit();
  const [selected, setSelected] = useState('stomach');
  const [playing, setPlaying] = useState(false);
  const active = organs.find(organ => organ.id === selected) ?? organs[2];

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSelected(current => organs[(organs.findIndex(organ => organ.id === current) + 1) % organs.length].id);
    }, 1500);
    return () => window.clearInterval(timer);
  }, [playing]);

  return (
    <div className={styles.digestiveLayout}>
      <div className={styles.modelStage}>
        <div
          className={`${styles.digestiveCanvas} ${orbit.dragging ? styles.dragging : ''}`}
          onPointerDown={orbit.start}
          onPointerMove={orbit.move}
          onPointerUp={orbit.end}
          onPointerCancel={orbit.end}
          style={{ transform: `perspective(800px) rotateX(${orbit.rotation.x}deg) rotateY(${orbit.rotation.y}deg)` }}
          role="img"
          aria-label="Interactive digestive system diagram"
        >
          <div className={styles.bodySilhouette} />
          <div className={`${styles.organ} ${styles.mouth} ${selected === 'mouth' ? styles.organActive : ''}`} onClick={() => setSelected('mouth')} />
          <div className={`${styles.organ} ${styles.oesophagus} ${selected === 'oesophagus' ? styles.organActive : ''}`} onClick={() => setSelected('oesophagus')} />
          <div className={`${styles.organ} ${styles.stomach} ${selected === 'stomach' ? styles.organActive : ''}`} onClick={() => setSelected('stomach')} />
          <div className={`${styles.organ} ${styles.liver} ${selected === 'liver' ? styles.organActive : ''}`} onClick={() => setSelected('liver')} />
          <div className={`${styles.organ} ${styles.pancreas} ${selected === 'pancreas' ? styles.organActive : ''}`} onClick={() => setSelected('pancreas')} />
          <div className={`${styles.organ} ${styles.smallIntestine} ${selected === 'small-intestine' ? styles.organActive : ''}`} onClick={() => setSelected('small-intestine')} />
          <div className={`${styles.organ} ${styles.largeIntestine} ${selected === 'large-intestine' ? styles.organActive : ''}`} onClick={() => setSelected('large-intestine')} />
          {playing && <span className={styles.foodParticle} />}
        </div>
        <div className={styles.modelHint}><Rotate3D size={15} /> Drag to orbit · tap an organ to inspect</div>
        <div className={styles.digestiveControls}>
          <button type="button" onClick={() => setPlaying(value => !value)}>{playing ? <Pause size={14} /> : <Play size={14} />}{playing ? 'Pause journey' : 'Start food journey'}</button>
          <button type="button" onClick={orbit.reset}>Reset view</button>
        </div>
      </div>
      <div className={styles.organPanel}>
        <span className={styles.panelEyebrow}>SELECTED ORGAN</span>
        <div className={styles.organTitle}><i style={{ background: active.color }} /> <h3>{active.label}</h3></div>
        <p>{active.detail}</p>
        <div className={styles.organSteps}>
          {organs.map((organ, index) => <button key={organ.id} type="button" className={selected === organ.id ? styles.stepActive : ''} onClick={() => setSelected(organ.id)}><span>{index + 1}</span>{organ.label}</button>)}
        </div>
      </div>
    </div>
  );
}

export function BiologyLab() {
  const [example, setExample] = useState<LabExample>('water');
  const [showTip, setShowTip] = useState(false);
  return (
    <section id="biology-lab" className={styles.lab} aria-labelledby="biology-lab-title">
      <div className={styles.labHeader}>
        <div><span className={styles.eyebrow}><Sparkles size={13} /> INTERACTIVE BIOLOGY LAB</span><h2 id="biology-lab-title">See the idea, not just the words.</h2><p>Rotate a model, inspect the labels, then explain what you noticed.</p></div>
        <button type="button" className={styles.tipButton} onClick={() => setShowTip(value => !value)} aria-expanded={showTip}><CircleHelp size={16} /> How to use</button>
      </div>
      {showTip && <div className={styles.tip}><Info size={16} /><span>Use one finger on a phone or your mouse to orbit the model. Tap a label to reveal a short explanation. The models are simplified learning aids, not to scale.</span></div>}
      <div className={styles.exampleTabs} role="tablist" aria-label="Choose a Biology Lab example">
        <button type="button" role="tab" aria-selected={example === 'water'} className={example === 'water' ? styles.tabActive : ''} onClick={() => setExample('water')}><span className={styles.tabIcon}>H₂O</span><span><strong>Water molecule</strong><small>Atoms and bonds</small></span></button>
        <button type="button" role="tab" aria-selected={example === 'digestion'} className={example === 'digestion' ? styles.tabActive : ''} onClick={() => setExample('digestion')}><span className={styles.tabIcon}>↝</span><span><strong>Digestive system</strong><small>Follow the food path</small></span></button>
      </div>
      {example === 'water' ? <><WaterMolecule /><div className={styles.lessonNote}><strong>Key idea</strong><span>Water is a polar molecule: oxygen pulls shared electrons more strongly, giving the molecule a slightly negative end and two slightly positive ends.</span></div></> : <><DigestiveSystem /><div className={styles.lessonNote}><strong>Quick check</strong><span>Why does the small intestine have many folds and villi? Select it in the model to reveal the clue.</span></div></>}
    </section>
  );
}
