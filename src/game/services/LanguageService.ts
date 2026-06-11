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
        money: 'Money',
        energy: 'Energy',
        day: 'Day',
        seedShopTitle: 'Seed Shop',
        toolShopTitle: 'Tool Shop',
        farmPurchaseTitle: 'Farm Land',
        buy: 'Buy',
        owned: 'Owned',
        notEnoughMoney: 'Not enough money',
        inventoryFull: 'Inventory full',
        purchased: 'Purchased',
        landPurchased: 'Purchased',
        alreadyOwned: 'Already owned',
        itemAlreadyOwned: 'You already own this item',
        enterHouse: 'E - Enter house',
        enterMarket: 'E - Enter market',
        enterSeedShop: 'E - Enter shop',
        enterToolShop: 'E - Enter tool shop',
        enterTownHall: 'E - Enter town hall',
        exitBuilding: 'E - Exit',
        sleep: 'E - Sleep',
        buySeeds: 'E - Buy seeds',
        buyTools: 'E - Buy tools',
        fillWateringCan: 'E - Fill watering can',
        water: 'Water',
        buyFarms: 'E - Buy farm land',
        farm2Name: 'Farm 2',
        farm3Name: 'Farm 3',
        itemAxe: 'Axe',
        itemHoe: 'Hoe',
        itemRod: 'Fishing Rod',
        itemSickle: 'Sickle',
        itemShovel: 'Shovel',
        itemSword: 'Sword',
        itemWateringCan: 'Watering Can',
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
        money: 'Dinheiro',
        energy: 'Energia',
        day: 'Dia',
        seedShopTitle: 'Loja de Sementes',
        toolShopTitle: 'Loja de Ferramentas',
        farmPurchaseTitle: 'Terrenos da Quinta',
        buy: 'Comprar',
        owned: 'Comprado',
        notEnoughMoney: 'Dinheiro insuficiente',
        inventoryFull: 'Inventário cheio',
        purchased: 'Compraste',
        landPurchased: 'Compraste',
        alreadyOwned: 'Terreno ja comprado',
        itemAlreadyOwned: 'Ja tens este item',
        enterHouse: 'E - Entrar em casa',
        enterMarket: 'E - Entrar no mercado',
        enterSeedShop: 'E - Entrar na loja',
        enterToolShop: 'E - Entrar na loja de ferramentas',
        enterTownHall: 'E - Entrar na câmara',
        exitBuilding: 'E - Sair',
        sleep: 'E - Dormir',
        buySeeds: 'E - Comprar sementes',
        buyTools: 'E - Comprar ferramentas',
        fillWateringCan: 'E - Encher regador',
        water: 'Agua',
        buyFarms: 'E - Comprar terrenos',
        farm2Name: 'Farm 2',
        farm3Name: 'Farm 3',
        itemAxe: 'Machado',
        itemHoe: 'Enxada',
        itemRod: 'Cana de Pesca',
        itemSickle: 'Foice',
        itemShovel: 'Pá',
        itemSword: 'Espada',
        itemWateringCan: 'Regador',
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
    const labelKey: TranslationKey = language === 'pt' ? 'portuguese' : 'english';

    return translate(labelKey);
}

function isGameLanguage(value: string | null): value is GameLanguage {
    return value === 'en' || value === 'pt';
}
