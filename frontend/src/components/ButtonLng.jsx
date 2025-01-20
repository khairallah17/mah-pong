import React, { useEffect } from 'react'
import getUnicodeFlagIcon from 'country-flag-icons/unicode'
import '../i18n';
import i18n from "i18next";
import cookies from "js-cookie"


function ButtonLng() {

  const currentLang = cookies.get('i18next') || 'en';

  useEffect(() => {
    document.dir = i18n.dir();
  }, []);

  const handleLanguageChange = (event) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    document.dir = i18n.dir();
  };

  const languages = [
    { code: 'en', flag: 'US', label: 'EN' },
    { code: 'fr', flag: 'FR', label: 'FR' },
    { code: 'de', flag: 'DE', label: 'DE' }
  ];

  return (
    <select 
      value={currentLang}
      onChange={handleLanguageChange}
      className="px-3 py-2 border border-black bg-[#C5C5C5] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {languages.map(({ code, flag, label }) => (
        <option key={code} value={code}>
          {getUnicodeFlagIcon(flag)} {label}
        </option>
      ))}
    </select>
  );
};

export default ButtonLng