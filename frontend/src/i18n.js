import React from 'react'
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';


i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(LanguageDetector)
  .use(HttpApi)
  .init({
    // lng: "en", // if you're using a language detector, do not define the lng option
    fallbackLng: "en",

    detection:
    {      
      // order and from where user language should be detected
      // order: ['cookie'],
      caches: ['cookie'] // cache user language on
    },
    backend:
    {
      loadPath: '/locales/{{lng}}/translate.json',
    },
  });

export default i18n;