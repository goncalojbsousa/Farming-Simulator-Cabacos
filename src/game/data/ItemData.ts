import type { TranslationKey } from '../services/LanguageService';

export type ItemId = string;
export type CropId = string;
export type CropStage = number;

export type GameItem = {
    id: ItemId;
    nameKey: TranslationKey;
    type: 'tool' | 'seed' | 'resource';
    assetPath: string;
    maxStackSize: number;
    cropId?: CropId;
    buyPrice?: number;
    sellPrice?: number;
};

export type SeedItem = GameItem & {
    type: 'seed';
    cropId: CropId;
    buyPrice: number;
    growthDays: number;
};

const tools = [
    { id: 'axe', nameKey: 'itemAxe' },
    { id: 'hammer', nameKey: 'itemHammer' },
    { id: 'pickaxe', nameKey: 'itemPickaxe' },
    { id: 'rod', nameKey: 'itemRod' },
    { id: 'shovel', nameKey: 'itemShovel' },
    { id: 'sword', nameKey: 'itemSword' }
] as const;

// To add a crop, add one line here and its images to the assets folder.
export const crops = [
    { id: 'beetroot', seedNameKey: 'seedBeetroot', harvestNameKey: 'cropBeetroot', buyPrice: 8, sellPrice: 12, growthDays: 6 },
    { id: 'cabbage', seedNameKey: 'seedCabbage', harvestNameKey: 'cropCabbage', buyPrice: 10, sellPrice: 15, growthDays: 9 },
    { id: 'carrot', seedNameKey: 'seedCarrot', harvestNameKey: 'cropCarrot', buyPrice: 5, sellPrice: 8, growthDays: 4 },
    { id: 'cauliflower', seedNameKey: 'seedCauliflower', harvestNameKey: 'cropCauliflower', buyPrice: 12, sellPrice: 18, growthDays: 12 },
    { id: 'kale', seedNameKey: 'seedKale', harvestNameKey: 'cropKale', buyPrice: 7, sellPrice: 11, growthDays: 6 },
    { id: 'parsnip', seedNameKey: 'seedParsnip', harvestNameKey: 'cropParsnip', buyPrice: 5, sellPrice: 8, growthDays: 4 },
    { id: 'potato', seedNameKey: 'seedPotato', harvestNameKey: 'cropPotato', buyPrice: 6, sellPrice: 10, growthDays: 6 },
    { id: 'pumpkin', seedNameKey: 'seedPumpkin', harvestNameKey: 'cropPumpkin', buyPrice: 15, sellPrice: 24, growthDays: 13 },
    { id: 'radish', seedNameKey: 'seedRadish', harvestNameKey: 'cropRadish', buyPrice: 6, sellPrice: 10, growthDays: 6 },
    { id: 'sunflower', seedNameKey: 'seedSunflower', harvestNameKey: 'cropSunflower', buyPrice: 10, sellPrice: 16, growthDays: 8 },
    { id: 'wheat', seedNameKey: 'seedWheat', harvestNameKey: 'cropWheat', buyPrice: 4, sellPrice: 7, growthDays: 4 }
] as const;

const toolItems: GameItem[] = tools.map((tool) => ({
    id: tool.id,
    nameKey: tool.nameKey,
    type: 'tool',
    assetPath: `tools/${tool.id}.png`,
    maxStackSize: 1
}));

const cropItems: GameItem[] = crops.flatMap((crop) => [
    {
        id: `${crop.id}Seed`,
        nameKey: crop.seedNameKey,
        type: 'seed',
        assetPath: `plantation/crops/${crop.id}_00.png`,
        cropId: crop.id,
        maxStackSize: 99,
        buyPrice: crop.buyPrice,
        growthDays: crop.growthDays
    },
    {
        id: `${crop.id}Harvest`,
        nameKey: crop.harvestNameKey,
        type: 'resource',
        assetPath: `plantation/crops/${crop.id}_05.png`,
        maxStackSize: 99,
        sellPrice: crop.sellPrice
    }
]);

export const gameItems = [...toolItems, ...cropItems];
export const cropStages: CropStage[] = [1, 2, 3, 4];

export function getItemById(itemId: ItemId): GameItem {
    return gameItems.find((item) => item.id === itemId)!;
}

export function getSeedItems(): SeedItem[] {
    return gameItems.filter((item) => item.type === 'seed') as SeedItem[];
}

export function getCropTextureKey(cropId: CropId, stage: CropStage): string {
    return `${cropId}_${String(stage).padStart(2, '0')}`;
}

export function getCropAssetPath(cropId: CropId, stage: CropStage): string {
    return `plantation/crops/${getCropTextureKey(cropId, stage)}.png`;
}

export const startingToolIds = ['axe', 'pickaxe', 'shovel', 'hammer', 'rod', 'sword'];
export const startingSeedIds = ['carrotSeed', 'potatoSeed', 'wheatSeed', 'pumpkinSeed'];
