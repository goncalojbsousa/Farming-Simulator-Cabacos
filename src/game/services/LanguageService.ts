export type GameLanguage = 'en' | 'pt';

const defaultLanguage: GameLanguage = 'pt';
const languageStorageKey = 'farming-simulator-cabacos-language';

const translations = {
    en: {
        gameTitle: 'Cabacos Farm',
        mainMenu: 'Main Menu',
        startGame: 'Start Game',
        settings: 'Settings',
        settingsTitle: 'Settings',
        language: 'Language',
        english: 'English',
        portuguese: 'Portuguese',
        back: 'Back',
        gameOver: 'Game Over'
    },
    pt: {
        gameTitle: 'Quinta Cabacos',
        mainMenu: 'Menu Principal',
        startGame: 'Começar Jogo',
        settings: 'Definições',
        settingsTitle: 'Definições',
        language: 'Idioma',
        english: 'Inglês',
        portuguese: 'Português',
        back: 'Voltar',
        gameOver: 'Fim do Jogo'
    }
};

export type TranslationKey = keyof typeof translations.en;

export function getCurrentLanguage(): GameLanguage {
    const savedLanguage = localStorage.getItem(languageStorageKey);

    if (isGameLanguage(savedLanguage)) {
        return savedLanguage;
    }

    return defaultLanguage;
}

export function setCurrentLanguage(language: GameLanguage): void {
    localStorage.setItem(languageStorageKey, language);
}

export function translate(key: TranslationKey): string {
    return translations[getCurrentLanguage()][key];
}

export function getAvailableLanguages(): GameLanguage[] {
    return ['pt', 'en'];
}

export function getLanguageLabel(language: GameLanguage): string {
    const labelKeyByLanguage: Record<GameLanguage, TranslationKey> = {
        en: 'english',
        pt: 'portuguese'
    };

    return translations[getCurrentLanguage()][labelKeyByLanguage[language]];
}

function isGameLanguage(value: string | null): value is GameLanguage {
    return value === 'en' || value === 'pt';
}
