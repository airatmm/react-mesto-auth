import React from "react";
import successAuth from '../images/success.svg';
import failAuth from '../images/fail.svg';

const InfoTooltip = ({onClose, infoToolTip}) => {
    const handleCloseByClick = (evt) => {
        if (evt.currentTarget === evt.target) {
            onClose();
        }
    }

    return (
        <div onClick={handleCloseByClick} className={`popup popup_type_tooltip ${infoToolTip.open && 'popup_opened'}`}>
            <div className="popup__content">
                <figure className="popup__fieldset">
                <button className="popup__close popup__close_button" type="button" onClick={onClose} />
                <img className="popup__icon" src={infoToolTip.status ? successAuth : failAuth} alt="Иконка статуса регистрации"/>
                <figcaption  className='popup__title popup__title_tooltip'>{infoToolTip.status ?
                    "Вы успешно зарегистрировались" :
                    "Что-то пошло не так! Попробуйте еще раз."}
                </figcaption >
                </figure>
            </div>
        </div>
    );
}

export default InfoTooltip;