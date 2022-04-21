import React from 'react';
import {Link, Route, Switch} from 'react-router-dom';
import logo from '../images/logo.svg';
import HeaderInfo from "./HeaderInfo";
import Hamburger from "./Hamburger";

function Header({ email, onSignOut, isHeaderInfoOpened, onHamburgerClick}) {
    // const {path} = useLocation();
    // const linkText = `${path === '/sign-in' ? 'Регистрация' : 'Войти'}`;
    // const linkPath = `${path === '/sign-in' ? 'sign-up' : 'sign-in'}`;

    return (
        <header className="header">
            <div className="header__content">
                <img className="header__logo" src={logo} alt="Логотип"/>
                {/*{loggedIn ?*/}
                {/*    (<>*/}
                {/*        <span className="header__email">{email}</span>*/}
                {/*        <Link to="/" className="link header__link header__link_signout" onClick={onSignOut}>Выйти</Link>*/}
                {/*    </>)*/}
                {/*    : (<Link to={linkPath} className="link header__link">{linkText}</Link>)*/}

                <Switch>
                    <Route exact path="/">
                        <HeaderInfo email={email} onSignOut={onSignOut} />
                        <Hamburger isHeaderInfoOpened={isHeaderInfoOpened} onHamburgerClick={onHamburgerClick}/>
                    </Route>
                    <Route path="/sign-up">
                        <Link to="/sign-in" className="header__link">Войти</Link>
                    </Route>
                    <Route path="/sign-in">
                        <Link to="/sign-up" className="header__link">Регистрация</Link>
                    </Route>
                </Switch>
            </div>
        </header>
    );
}

export default Header;