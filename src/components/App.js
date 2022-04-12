import React, {useEffect, useState} from 'react';
import Header from './Header';
import Main from './Main'
import Footer from './Footer'
import ImagePopup from './ImagePopup';
import api from '../utils/api';
import {CurrentUserContext} from '../contexts/CurrentUserContext';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import ConfirmDeletePopup from "./ConfirmDeletePopup";


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
        Promise.all([
            api.getCards(),
            api.getUserInfo()
        ])
            .then(([cards, info]) => {
                setCards(cards);
                setCurrentUser(info);
            })
            .catch((err) => console.log(`Ошибка загрузки данных с сервера (cards or userInfo) ${err}`));
    }, []);



    return (
        <CurrentUserContext.Provider value={currentUser}>
            <div className="App" /*onClick={handleCloseByClick}*/>
                <Header/>
                <Main
                    cards={cards}
                    onEditProfile={handleEditProfileClick}
                    onAddPlace={handleAddPlaceClick}
                    onEditAvatar={handleEditAvatarClick}
                    onCardClick={handleCardClick}
                    onCardLike={handleCardLike}
                    onCardDeleteClick={handleConfirmDeleteCard}
                />
                <Footer/>

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
            </div>
        </CurrentUserContext.Provider>
    );
}

export default App;
