import React from 'react';

function Hamburger({ isHeaderInfoOpened, onHamburgerClick }) {
    const hamburgerClassName =
        `hamburger
    ${isHeaderInfoOpened
            ? 'hamburger_opened'
            : 'hamburger_closed'}`;

    return (
        <button
            className={hamburgerClassName}
            onClick={onHamburgerClick}>
            <span/>
        </button>
    )
}

export default Hamburger;