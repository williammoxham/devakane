import { useState } from 'react';
import { Link } from 'react-router-dom';
import { neighborhoods } from '../../data/neighborhoods.js';
import Plate from '../Plate.jsx';

export const QUESTIONS = [
  {
    q: 'A perfect Saturday morning starts with',
    options: [
      ['A paddle out or a walk on the beach', { coast: 3 }],
      ['Coffee and the farmers market', { village: 3, walk: 2 }],
      ['A trail run under the redwoods', { redwood: 3 }],
      ['Puttering in a big garden', { space: 3, sun: 1 }],
    ],
  },
  {
    q: 'Your commute is mostly',
    options: [
      ['Over Highway 17 to the South Bay', { over17: 3 }],
      ['Around town, or remote', { walk: 1, village: 1 }],
      ['South toward Monterey', { south: 3 }],
    ],
  },
  {
    q: 'How do you feel about summer fog?',
    options: [
      ['Love it. Natural air conditioning.', { coast: 2 }],
      ['Fine in the morning, sun by lunch', { sun: 1, coast: 1 }],
      ['I want sunshine', { sun: 3 }],
    ],
  },
  {
    q: 'Day to day, you would rather have',
    options: [
      ['Everything within a walk', { walk: 3, village: 1 }],
      ['A yard and some breathing room', { space: 2 }],
      ['Real land, trees, and privacy', { space: 3, redwood: 1 }],
    ],
  },
];

export function score(answers) {
  const want = {};
  answers.forEach((w) => Object.entries(w).forEach(([k, v]) => (want[k] = (want[k] || 0) + v)));
  return neighborhoods
    .map((n) => ({ n, s: Object.entries(want).reduce((acc, [k, v]) => acc + v * (n.traits[k] || 0), 0) }))
    .sort((a, b) => b.s - a.s);
}

export default function NeighborhoodMatch() {
  const [answers, setAnswers] = useState([]);
  const step = answers.length;
  const done = step === QUESTIONS.length;
  const results = done ? score(answers).slice(0, 3) : [];

  return (
    <div className="widget match">
      <div className="match__progress" aria-hidden="true">
        {QUESTIONS.map((_, i) => <i key={i} className={i < step ? 'is-done' : i === step ? 'is-now' : ''} />)}
      </div>

      {!done ? (
        <div className="match__q" key={step}>
          <p className="match__count">Question {step + 1} of {QUESTIONS.length}</p>
          <h3>{QUESTIONS[step].q}</h3>
          <div className="match__opts">
            {QUESTIONS[step].options.map(([label, w]) => (
              <button key={label} type="button" onClick={() => setAnswers([...answers, w])}>{label}</button>
            ))}
          </div>
          {step > 0 && (
            <button type="button" className="textbtn" onClick={() => setAnswers(answers.slice(0, -1))}>Back</button>
          )}
        </div>
      ) : (
        <div className="match__results">
          <h3>Places to start looking</h3>
          <ol>
            {results.map(({ n }, i) => (
              <li key={n.slug} className={i === 0 ? 'is-top' : ''}>
                <Plate scene={n.scene} tone={n.tone} photo={n.photo} alt={n.name} />
                <div>
                  <strong>{n.name}</strong>
                  <p>{n.line}</p>
                  <Link to={`/neighborhoods#${n.slug}`}>See {n.name} on the map</Link>
                </div>
              </li>
            ))}
          </ol>
          <button type="button" className="textbtn" onClick={() => setAnswers([])}>Start over</button>
        </div>
      )}
    </div>
  );
}
