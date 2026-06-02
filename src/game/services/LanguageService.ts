export type GameLanguage = 'en' | 'pt';

const defaultLanguage: GameLanguage = 'pt';
const languageStorageKey = 'farming-simulator-cabacos-language';

const translations = {
    en: {
        gameTitle: 'Cabacos Farm',
        startGame: 'Start Game',
        settings: 'Settings',
        settingsTitle: 'Settings',
        language: 'Language',
        english: 'English',
        portuguese: 'Portuguese',
        back: 'Back',
        gameOver: 'Game Over',
        inventoryTitle: 'Inventory',
        itemAxe: 'Axe',
        itemHammer: 'Hammer',
        itemPickaxe: 'Pickaxe',
        itemRod: 'Fishing Rod',
        itemShovel: 'Shovel',
        itemSword: 'Sword',
        seedBeetroot: 'Beetroot Seeds',
        seedCabbage: 'Cabbage Seeds',
        seedCarrot: 'Carrot Seeds',
        seedCauliflower: 'Cauliflower Seeds',
        seedKale: 'Kale Seeds',
        seedParsnip: 'Parsnip Seeds',
        seedPotato: 'Potato Seeds',
        seedPumpkin: 'Pumpkin Seeds',
        seedRadish: 'Radish Seeds',
        seedSunflower: 'Sunflower Seeds',
        seedWheat: 'Wheat Seeds',
        cropBeetroot: 'Beetroot',
        cropCabbage: 'Cabbage',
        cropCarrot: 'Carrot',
        cropCauliflower: 'Cauliflower',
        cropKale: 'Kale',
        cropParsnip: 'Parsnip',
        cropPotato: 'Potato',
        cropPumpkin: 'Pumpkin',
        cropRadish: 'Radish',
        cropSunflower: 'Sunflower',
        cropWheat: 'Wheat'
    },
    pt: {
        gameTitle: 'Quinta Cabacos',
        startGame: 'Começar Jogo',
        settings: 'Definições',
        settingsTitle: 'Definições',
        language: 'Idioma',
        english: 'Inglês',
        portuguese: 'Português',
        back: 'Voltar',
        gameOver: 'Fim do Jogo',
        inventoryTitle: 'Inventário',
        itemAxe: 'Machado',
        itemHammer: 'Martelo',
        itemPickaxe: 'Picareta',
        itemRod: 'Cana de Pesca',
        itemShovel: 'Pá',
        itemSword: 'Espada',
        seedBeetroot: 'Sementes de Beterraba',
        seedCabbage: 'Sementes de Couve',
        seedCarrot: 'Sementes de Cenoura',
        seedCauliflower: 'Sementes de Couve-flor',
        seedKale: 'Sementes de Couve-galega',
        seedParsnip: 'Sementes de Pastinaca',
        seedPotato: 'Sementes de Batata',
        seedPumpkin: 'Sementes de Abóbora',
        seedRadish: 'Sementes de Rabanete',
        seedSunflower: 'Sementes de Girassol',
        seedWheat: 'Sementes de Trigo',
        cropBeetroot: 'Beterraba',
        cropCabbage: 'Couve',
        cropCarrot: 'Cenoura',
        cropCauliflower: 'Couve-flor',
        cropKale: 'Couve-galega',
        cropParsnip: 'Pastinaca',
        cropPotato: 'Batata',
        cropPumpkin: 'Abóbora',
        cropRadish: 'Rabanete',
        cropSunflower: 'Girassol',
        cropWheat: 'Trigo'
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
