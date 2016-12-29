import React from 'react';
import {Link} from 'react-router';

const IndexComponent = () => (
    <div>
        <h1>Interactive Lecture Notes on Quantum Computation</h1>
        <p>
            Lecture notes with interactive visualisations. Written with React and D3.
        </p>
        <ul>
            <li>
                <Link to="grover">Grover Search</Link>
            </li>
            <li>
                <Link to="shor">Shor's Factoring Algorithm</Link>
            </li>
        </ul>
    </div>
);

export default IndexComponent;