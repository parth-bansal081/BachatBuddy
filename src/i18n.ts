import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources: {
            en: {
                translation: {
                    "welcome": "Welcome to BachatBuddy",
                    "onboarding_title": "Let's set up your financial profile",
                    "income": "Monthly Income",
                    "goal": "Monthly Savings Target",
                    "currency": "Currency",
                    "connect_bank": "Connect Your Bank",
                    "next": "Next",
                    "save": "Save Profile"
                }
            },
            hi: {
                translation: {
                    "welcome": "BachatBuddy में आपका स्वागत है",
                    "onboarding_title": "आइए अपना वित्तीय प्रोफ़ाइल सेट करें",
                    "income": "मासिक आय",
                    "goal": "मासिक बचत लक्ष्य",
                    "currency": "मुद्रा",
                    "connect_bank": "अपना बैंक कनेक्ट करें",
                    "next": "अगला",
                    "save": "प्रोफ़ाइल सहेजें"
                }
            }
        }
    });

export default i18n;
