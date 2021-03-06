import React, {useEffect, useState} from 'react';
import {Redirect, Route, Switch, useHistory} from 'react-router-dom';
import Header from './Header';
import Main from './Main'
import Footer from './Footer'
import ImagePopup from './ImagePopup';
import Login from './Login';
import Register from "./Register";
import InfoTooltip from './InfoTooltip'
import api from '../utils/api';
import {CurrentUserContext} from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmDeletePopup from "./ConfirmDeletePopup";
import ProtectedRoute from './ProtectedRoute';
import * as auth from '../utils/auth';
import {getToken, removeToken, setToken} from "../utils/token.js";
import HeaderInfoMobile from "./HeaderInfoMobile";

function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
    const [isConfirmDeletePopupOpen, setIsConfirmDeletePopupOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [currentUser, setCurrentUser] = useState({});
    const [cards, setCards] = useState([]);
    const [cardDelete, setCardDelete] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState({
        email: ""
    });
    const [infoToolTip, setInfoToolTip] = useState({
        open: false,
        status: false
    });
    const [loggedIn, setLoggedIn] = useState(false);
    const [isHeaderInfoOpened, setIsHeaderInfoOpened] = useState(false);
    const history = useHistory();

    //const location = useLocation();


    function handleEditProfileClick() {
        setIsEditProfilePopupOpen(true);
    }

    function handleAddPlaceClick() {
        setIsAddPlacePopupOpen(true);
    }

    function handleEditAvatarClick() {
        setIsEditAvatarPopupOpen(true);
    }

    function handleCardClick(card) {
        setSelectedCard(card);
    }

    function handleConfirmDeleteCard(card) {
        setIsConfirmDeletePopupOpen(true);
        setCardDelete(card);
    }

    function closeAllPopups() {
        setIsEditProfilePopupOpen(false);
        setIsAddPlacePopupOpen(false);
        setIsEditAvatarPopupOpen(false);
        setIsConfirmDeletePopupOpen(false);
        setSelectedCard(null);
        setInfoToolTip({
            open: false,
            status: false
        });
    }

    function handleCardLike(card) {
        // ?????????? ??????????????????, ???????? ???? ?????? ???????? ???? ???????? ????????????????
        const isLiked = card.likes.some(i => i._id === currentUser._id);

        // ???????????????????? ???????????? ?? API ?? ???????????????? ?????????????????????? ???????????? ????????????????
        api.changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((state) => state.map((c) => c._id === card._id ? newCard : c))
            })
            .catch((err) => console.log(`???????????? ${err}`));
    }

    function handleCardDelete() {
        api.deleteCard(cardDelete._id)
            .then(() => {
                const newCards = cards.filter((c) => c._id !== cardDelete._id);
                setCards(newCards);
            })
            .catch(err => {
                console.log(`???????????? ?????? ???????????????? ????????????????: ${err} `)
            })
    }

    function handleUpdateUser(info) {
        setIsLoading(true);
        api.editProfile(info)
            .then((res) => {
                setCurrentUser(res);
                closeAllPopups();
            })
            .catch((err) => console.log(`???????????? ???????????????????? ?????????????? ${err}`))
            .finally(() => setIsLoading(false));
    }

    function handleUpdateAvatar(avatar) {
        setIsLoading(true);
        api.changeUserAvatar(avatar)
            .then((res) => {
                setCurrentUser(res);
                closeAllPopups();
            })
            .catch((err) => console.log(`???????????? ???????????????????? ?????????????? ${err}`))
            .finally(() => setIsLoading(false));
    }

    function handleAddPlaceSubmit(newCard) {
        setIsLoading(true);
        api.addNewCard(newCard)
            .then((newCard) => {
                setCards([newCard, ...cards]);
                closeAllPopups();
            })
            .catch((err) => console.log(`???????????? ???????????????????? ?????????? ???????????????? ${err}`))
            .finally(() => setIsLoading(false));
    }

    useEffect(() => {
        if (loggedIn) { // ?????????? ???? ????????????????, ?????????? ???? ?????????????????? ???????? ?????? ?????? ??????????????
            Promise.all([
                api.getCards(),
                api.getUserInfo()
            ])
                .then(([cards, info]) => {
                    setCards(cards);
                    setCurrentUser(info);
                })
                .catch((err) => console.log(`???????????? ???????????????? ???????????? ?? ?????????????? (cards ?????? userInfo) ${err}`));
        }
    }, [loggedIn]);


    useEffect(() => {
        const jwt = getToken();
        if (jwt) {
            auth.getContent(jwt)
                .then((res) => {
                    if (res && res.data.email) {
                        // console.log(res)
                        setLoggedIn(true);
                        setData({
                            email: res.data.email
                        });
                        history.push("/");
                    } else {
                        history.push("/sign-in")
                    }
                })
                .catch((err) => {
                    console.error(err);
                    setLoggedIn(false);
                    setData({
                        email: ""
                    });
                });
        }
    }, [loggedIn, history]);

    const checkRes = (res) => {
        if (res.jwt) {
            setToken(res.jwt);
            setData({
                email: res.data.email
            });
            // setLoggedIn(true);
            // history.replace({pathname: "/"});
        }
    };

    const handleSignOut = () => {
        setLoggedIn(false);
        setData({
            email: null
        });
        removeToken();
        history.push('/sign-in');

    }

    const handleLogin = (email, password) => {
        setIsLoading(true);
        auth.authorize(email, password)
            .then((res) => {
                checkRes(res)
                setLoggedIn(true);
                history.push('/');
            })
            .catch((err) => {
                console.error(err)
                setInfoToolTip({
                    open: true,
                    status: false
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleRegister = (email, password) => {
        setIsLoading(true);
        auth.register(email, password)
            .then((res) => {
                checkRes(res)
                history.replace({pathname: '/sign-in'})
                setInfoToolTip({
                    open: true,
                    status: true
                });
            })
            .catch((err) => {
                console.error(err)
                setInfoToolTip({
                    open: true,
                    status: false
                });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // ????????????????/???????????????? ???????? ???????????????????????? ?? ?????????????????? ????????????
    const openHeaderInfo = () => {
        setIsHeaderInfoOpened(!isHeaderInfoOpened);
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <>
                {(loggedIn && isHeaderInfoOpened)
                    && (<HeaderInfoMobile
                        email={data.email}
                        onSignOut={handleSignOut}
                        isHeaderInfoOpened={isHeaderInfoOpened}
                    />)}

                <Header
                    loggedIn={loggedIn}
                    onSignOut={handleSignOut}
                    email={data.email}
                    isHeaderInfoOpened={isHeaderInfoOpened}
                    onHamburgerClick={openHeaderInfo}
                    // locaction={location}
                />
                <Switch>
                    <ProtectedRoute
                        exact path="/"
                        loggedIn={loggedIn}
                        component={Main}
                        cards={cards}
                        onEditProfile={handleEditProfileClick}
                        onAddPlace={handleAddPlaceClick}
                        onEditAvatar={handleEditAvatarClick}
                        onCardClick={handleCardClick}
                        onCardLike={handleCardLike}
                        onCardDeleteClick={handleConfirmDeleteCard}
                    />
                    <Route path='/sign-in'>
                        <Login
                            onLogin={handleLogin}
                            isLoading={isLoading}
                        />
                    </Route>
                    <Route path='/sign-up'>
                        <Register
                            onRegister={handleRegister}
                            isLoading={isLoading}
                        />
                    </Route>
                    <Route>
                        {loggedIn ? <Redirect to="/"/> : <Redirect to="/sign-in"/>}
                    </Route>

                </Switch>
                <Footer/>

                <InfoTooltip
                    infoToolTip={infoToolTip}
                    onClose={closeAllPopups}
                />

                <EditProfilePopup
                    isOpen={isEditProfilePopupOpen}
                    onClose={closeAllPopups}
                    onUpdateUser={handleUpdateUser}
                    isLoading={isLoading}
                />

                <AddPlacePopup
                    isOpen={isAddPlacePopupOpen}
                    onClose={closeAllPopups}
                    onAddPlace={handleAddPlaceSubmit}
                    isLoading={isLoading}
                />

                <EditAvatarPopup
                    isOpen={isEditAvatarPopupOpen}
                    onClose={closeAllPopups}
                    onUpdateAvatar={handleUpdateAvatar}
                    isLoading={isLoading}
                />

                <ConfirmDeletePopup
                    isOpen={isConfirmDeletePopupOpen}
                    onClose={closeAllPopups}
                    onCardDelete={handleCardDelete}
                >
                </ConfirmDeletePopup>

                <ImagePopup
                    card={selectedCard}
                    onClose={closeAllPopups}
                >
                </ImagePopup>
            </>
        </CurrentUserContext.Provider>
    );
}

export default App;
