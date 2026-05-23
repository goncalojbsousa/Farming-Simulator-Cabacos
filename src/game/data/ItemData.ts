import type { TranslationKey } from '../services/LanguageService';

export type ItemId = 'axe' | 'hammer' | 'pickaxe' | 'rod' | 'shovel' | 'sword';
export type ItemType = 'tool' | 'resource' | 'seed';

export type GameItem = {
    id: ItemId;
    nameKey: TranslationKey;
    type: ItemType;
    textureKey: string;
    assetPath: string;
    maxStackSize: number;
};

export const gameItems: Record<ItemId, GameItem> = {
    axe: {
        id: 'axe',
        nameKey: 'itemAxe',
        type: 'tool',
        textureKey: 'itemAxe',
        assetPath: 'tools/axe.png',
        maxStackSize: 1
    },
    hammer: {
        id: 'hammer',
        nameKey: 'itemHammer',
        type: 'tool',
        textureKey: 'itemHammer',
        assetPath: 'tools/hammer.png',
        maxStackSize: 1
    },
    pickaxe: {
        id: 'pickaxe',
        nameKey: 'itemPickaxe',
        type: 'tool',
        textureKey: 'itemPickaxe',
        assetPath: 'tools/pickaxe.png',
        maxStackSize: 1
    },
    rod: {
        id: 'rod',
        nameKey: 'itemRod',
        type: 'tool',
        textureKey: 'itemRod',
        assetPath: 'tools/rod.png',
        maxStackSize: 1
    },
    shovel: {
        id: 'shovel',
        nameKey: 'itemShovel',
        type: 'tool',
        textureKey: 'itemShovel',
        assetPath: 'tools/shovel.png',
        maxStackSize: 1
    },
    sword: {
        id: 'sword',
        nameKey: 'itemSword',
        type: 'tool',
        textureKey: 'itemSword',
        assetPath: 'tools/sword.png',
        maxStackSize: 1
    }
};

export function getItemById(itemId: ItemId): GameItem {
    return gameItems[itemId];
}

export function getAllItems(): GameItem[] {
    return Object.values(gameItems);
}

export function getStartingItemIds(): ItemId[] {
    return ['axe', 'pickaxe', 'shovel', 'hammer', 'rod', 'sword'];
}
