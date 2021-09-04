import React from 'react';
import './Menu.scss';

function Menu({places}) {
  return (
    <ol>
      {places.map(({disp, id}) => (
        <li key={id}>{disp}</li>
      ))}
    </ol>
  );
};

export default Menu;
