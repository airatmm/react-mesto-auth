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


function App() {
    const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
    const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
    const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
    const [isConfirmDeletePopupOpen, setIsConfirmDeletePopupOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [currentUser, setCurrentUser] = useState({});
    const [cards, setCards] = useState([]);
    const [cardDelete, setCardDelete] = useState({});
    const [isLoading, setLoading] = useState(false);

    const [data, setData] = useState({
        email: ""
    });
    const [loggedIn, setLoggedIn] = useState(false);
    const [isRegisterSuccess, setIsRegisterSuccess] = useState(false);


    const [isInfoTooltipPopupOpen, setIsInfoTooltipPopupOpen] = useState(false);
    // попап результата регистрации

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
        setIsInfoTooltipPopupOpen(false);
    }

    function handleCardLike(card) {
        // Снова проверяем, есть ли уже лайк на этой карточке
        const isLiked = card.likes.some(i => i._id === currentUser._id);

        // Отправляем запрос в API и получаем обновлённые данные карточки
        api.changeLikeCardStatus(card._id, !isLiked)
            .then((newCard) => {
                setCards((state) => state.map((c) => c._id === card._id ? newCard : c))
            })
            .catch((err) => console.log(`Ошибка ${err}`));
    }

    function handleCardDelete() {
        api.deleteCard(cardDelete._id)
            .then(() => {
                const newCards = cards.filter((c) => c._id !== cardDelete._id);
                setCards(newCards);
            })
            .catch(err => {
                console.log(`Ошибка при удалении карточки: ${err} `)
            })
    }

    function handleUpdateUser(info) {
        setLoading(true);
        api.editProfile(info)
            .then((res) => {
                setCurrentUser(res);
                closeAllPopups();
            })
            .catch((err) => console.log(`Ошибка обновления профиля ${err}`))
            .finally(() => setLoading(false));
    }

    function handleUpdateAvatar(avatar) {
        setLoading(true);
        api.changeUserAvatar(avatar)
            .then((res) => {
                setCurrentUser(res);
                closeAllPopups();
            })
            .catch((err) => console.log(`Ошибка обновления аватара ${err}`))
            .finally(() => setLoading(false));
    }

    function handleAddPlaceSubmit(newCard) {
        setLoading(true);
        api.addNewCard(newCard)
            .then((newCard) => {
                setCards([newCard, ...cards]);
                closeAllPopups();
            })
            .catch((err) => console.log(`Ошибка добавления новой карточки ${err}`))
            .finally(() => setLoading(false));
    }


    useEffect(() => {
        if (loggedIn) {
            Promise.all([
                api.getCards(),
                api.getUserInfo()
            ])
                .then(([cards, info]) => {
                    setCards(cards);
                    setCurrentUser(info);
                })
                .catch((err) => console.log(`Ошибка загрузки данных с сервера (cards or userInfo) ${err}`));
        }
    }, [loggedIn]);


    useEffect(() => {
        const jwt = getToken();
        if (jwt) {
            auth.getContent(jwt)
                .then((res) => {
                    console.log(res)
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
        setLoading(true);
        auth.authorize(email, password)
            .then((res) => {
                checkRes(res)
                setLoggedIn(true);
                history.push('/');
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleRegister = (email, password) => {
        setLoading(true);
        auth.register(email, password)
            .then((res) => {
                checkRes(res)
                history.replace({pathname: '/sign-in'});
            })
            .then(() => {
                setIsRegisterSuccess(true);
            })
            .catch((err) => {
                console.error(err)
                setIsRegisterSuccess(false);
            })
            .finally(() => {
                setIsInfoTooltipPopupOpen(true);
                setLoading(false);
            });
    };

    return (
        <CurrentUserContext.Provider value={currentUser}>
            <>
                <Header
                    loggedIn={loggedIn}
                    onSignOut={handleSignOut}
                    email={data.email}
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
                    isRegisterSuccess={isRegisterSuccess}
                    isOpen={isInfoTooltipPopupOpen}
                    onClose={closeAllPopups}
                    loggedIn={loggedIn}
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
