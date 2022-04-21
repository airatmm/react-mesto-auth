import React from "react";
import successAuth from '../images/success.svg';
import failAuth from '../images/fail.svg';

function InfoTooltip({isOpen, onClose, isRegisterSuccess}) {
    function handleCloseByClick(evt) {
        if (evt.currentTarget === evt.target) {
            onClose();
        }
    }

    return (
        <div onClick={handleCloseByClick} className={`popup popup_type_tooltip ${isOpen && 'popup_opened'}`}>
            <div className="popup__content">
                <figure className="popup__fieldset">
                <button className="popup__close popup__close_button" type="button" onClick={onClose} />
                <img className="popup__icon" src={isRegisterSuccess ? successAuth : failAuth} alt="Иконка статуса регистрации"/>
                <figcaption  className='popup__title popup__title_tooltip'>{isRegisterSuccess ?
                    "Вы успешно зарегистрировались" :
                    "Что-то пошло не так! Попробуйте еще раз."}
                </figcaption >
                </figure>
            </div>
        </div>
    );
}

export default InfoTooltip;