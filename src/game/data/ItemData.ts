import type { TranslationKey } from '../services/LanguageService';

export type ItemType = 'tool' | 'resource' | 'seed';

type ItemDefinition = {
    id: string;
    nameKey: TranslationKey;
    type: ItemType;
    assetPath: string;
    cropId?: string;
    maxStackSize: number;
    buyPrice?: number;
    sellPrice?: number;
};

export const cropStages = [1, 2, 3, 4] as const;

export type CropStage = typeof cropStages[number];

export const gameItems = [
    {
        id: 'axe',
        nameKey: 'itemAxe',
        type: 'tool',
        assetPath: 'tools/axe.png',
        maxStackSize: 1
    },
    {
        id: 'hammer',
        nameKey: 'itemHammer',
        type: 'tool',
        assetPath: 'tools/hammer.png',
        maxStackSize: 1
    },
    {
        id: 'pickaxe',
        nameKey: 'itemPickaxe',
        type: 'tool',
        assetPath: 'tools/pickaxe.png',
        maxStackSize: 1
    },
    {
        id: 'rod',
        nameKey: 'itemRod',
        type: 'tool',
        assetPath: 'tools/rod.png',
        maxStackSize: 1
    },
    {
        id: 'shovel',
        nameKey: 'itemShovel',
        type: 'tool',
        assetPath: 'tools/shovel.png',
        maxStackSize: 1
    },
    {
        id: 'sword',
        nameKey: 'itemSword',
        type: 'tool',
        assetPath: 'tools/sword.png',
        maxStackSize: 1
    },
    {
        id: 'beetrootSeed',
        nameKey: 'seedBeetroot',
        type: 'seed',
        assetPath: 'plantation/crops/beetroot_00.png',
        cropId: 'beetroot',
        maxStackSize: 99,
        buyPrice: 8
    },
    {
        id: 'beetrootHarvest',
        nameKey: 'cropBeetroot',
        type: 'resource',
        assetPath: 'plantation/crops/beetroot_05.png',
        maxStackSize: 99,
        sellPrice: 12
    },
    {
        id: 'cabbageSeed',
        nameKey: 'seedCabbage',
        type: 'seed',
        assetPath: 'plantation/crops/cabbage_00.png',
        cropId: 'cabbage',
        maxStackSize: 99,
        buyPrice: 10
    },
    {
        id: 'cabbageHarvest',
        nameKey: 'cropCabbage',
        type: 'resource',
        assetPath: 'plantation/crops/cabbage_05.png',
        maxStackSize: 99,
        sellPrice: 15
    },
    {
        id: 'carrotSeed',
        nameKey: 'seedCarrot',
        type: 'seed',
        assetPath: 'plantation/crops/carrot_00.png',
        cropId: 'carrot',
        maxStackSize: 99,
        buyPrice: 5
    },
    {
        id: 'carrotHarvest',
        nameKey: 'cropCarrot',
        type: 'resource',
        assetPath: 'plantation/crops/carrot_05.png',
        maxStackSize: 99,
        sellPrice: 8
    },
    {
        id: 'cauliflowerSeed',
        nameKey: 'seedCauliflower',
        type: 'seed',
        assetPath: 'plantation/crops/cauliflower_00.png',
        cropId: 'cauliflower',
        maxStackSize: 99,
        buyPrice: 12
    },
    {
        id: 'cauliflowerHarvest',
        nameKey: 'cropCauliflower',
        type: 'resource',
        assetPath: 'plantation/crops/cauliflower_05.png',
        maxStackSize: 99,
        sellPrice: 18
    },
    {
        id: 'kaleSeed',
        nameKey: 'seedKale',
        type: 'seed',
        assetPath: 'plantation/crops/kale_00.png',
        cropId: 'kale',
        maxStackSize: 99,
        buyPrice: 7
    },
    {
        id: 'kaleHarvest',
        nameKey: 'cropKale',
        type: 'resource',
        assetPath: 'plantation/crops/kale_05.png',
        maxStackSize: 99,
        sellPrice: 11
    },
    {
        id: 'parsnipSeed',
        nameKey: 'seedParsnip',
        type: 'seed',
        assetPath: 'plantation/crops/parsnip_00.png',
        cropId: 'parsnip',
        maxStackSize: 99,
        buyPrice: 5
    },
    {
        id: 'parsnipHarvest',
        nameKey: 'cropParsnip',
        type: 'resource',
        assetPath: 'plantation/crops/parsnip_05.png',
        maxStackSize: 99,
        sellPrice: 8
    },
    {
        id: 'potatoSeed',
        nameKey: 'seedPotato',
        type: 'seed',
        assetPath: 'plantation/crops/potato_00.png',
        cropId: 'potato',
        maxStackSize: 99,
        buyPrice: 6
    },
    {
        id: 'potatoHarvest',
        nameKey: 'cropPotato',
        type: 'resource',
        assetPath: 'plantation/crops/potato_05.png',
        maxStackSize: 99,
        sellPrice: 10
    },
    {
        id: 'pumpkinSeed',
        nameKey: 'seedPumpkin',
        type: 'seed',
        assetPath: 'plantation/crops/pumpkin_00.png',
        cropId: 'pumpkin',
        maxStackSize: 99,
        buyPrice: 15
    },
    {
        id: 'pumpkinHarvest',
        nameKey: 'cropPumpkin',
        type: 'resource',
        assetPath: 'plantation/crops/pumpkin_05.png',
        maxStackSize: 99,
        sellPrice: 24
    },
    {
        id: 'radishSeed',
        nameKey: 'seedRadish',
        type: 'seed',
        assetPath: 'plantation/crops/radish_00.png',
        cropId: 'radish',
        maxStackSize: 99,
        buyPrice: 6
    },
    {
        id: 'radishHarvest',
        nameKey: 'cropRadish',
        type: 'resource',
        assetPath: 'plantation/crops/radish_05.png',
        maxStackSize: 99,
        sellPrice: 10
    },
    {
        id: 'sunflowerSeed',
        nameKey: 'seedSunflower',
        type: 'seed',
        assetPath: 'plantation/crops/sunflower_00.png',
        cropId: 'sunflower',
        maxStackSize: 99,
        buyPrice: 10
    },
    {
        id: 'sunflowerHarvest',
        nameKey: 'cropSunflower',
        type: 'resource',
        assetPath: 'plantation/crops/sunflower_05.png',
        maxStackSize: 99,
        sellPrice: 16
    },
    {
        id: 'wheatSeed',
        nameKey: 'seedWheat',
        type: 'seed',
        assetPath: 'plantation/crops/wheat_00.png',
        cropId: 'wheat',
        maxStackSize: 99,
        buyPrice: 4
    },
    {
        id: 'wheatHarvest',
        nameKey: 'cropWheat',
        type: 'resource',
        assetPath: 'plantation/crops/wheat_05.png',
        maxStackSize: 99,
        sellPrice: 7
    }
] as const satisfies readonly ItemDefinition[];

export type GameItem = typeof gameItems[number];
export type SeedItem = Extract<GameItem, { type: 'seed' }>;
export type ItemId = typeof gameItems[number]['id'];

export function getItemById(itemId: ItemId): GameItem {
    return gameItems.find((item) => item.id === itemId)!;
}

export function getAllItems(): readonly GameItem[] {
    return gameItems;
}

export function getSeedItems(): SeedItem[] {
    return gameItems.filter((item): item is SeedItem => item.type === 'seed');
}

export function getCropTextureKey(cropId: string, stage: CropStage): string {
    return `${cropId}_${String(stage).padStart(2, '0')}`;
}

export function getCropAssetPath(cropId: string, stage: CropStage): string {
    return `plantation/crops/${getCropTextureKey(cropId, stage)}.png`;
}

export function getStartingItemIds(): ItemId[] {
    return ['axe', 'pickaxe', 'shovel', 'hammer', 'rod', 'sword'];
}

export function getStartingSeedItemIds(): ItemId[] {
    return ['carrotSeed', 'potatoSeed', 'wheatSeed', 'pumpkinSeed'];
}
