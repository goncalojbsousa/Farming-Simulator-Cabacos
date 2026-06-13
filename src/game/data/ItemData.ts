import type { TranslationKey } from '../services/LanguageService';

export type ItemId = string;
export type CropId = string;
export type CropStage = number;

export type GameItem = {
    id: ItemId;
    nameKey: TranslationKey;
    type: 'tool' | 'seed' | 'resource';
    assetPath: string;
    textureKey: string;
    textureFrame?: number;
    maxStackSize: number;
    cropId?: CropId;
    buyPrice?: number;
    sellPrice?: number;
};

export type SeedItem = GameItem & {
    type: 'seed';
    cropId: CropId;
    buyPrice: number;
    stageGrowthDays: readonly number[];
};

export type ToolItem = GameItem & {
    type: 'tool';
    buyPrice: number;
};

const tools = [
    { id: 'axe', nameKey: 'itemAxe', assetPath: 'tools/axe.png', buyPrice: 45 },
    { id: 'hoe', nameKey: 'itemHoe', assetPath: 'tools/hoe.png', buyPrice: 35 },
    { id: 'rod', nameKey: 'itemRod', assetPath: 'tools/rod.png', buyPrice: 50 },
    { id: 'sickle', nameKey: 'itemSickle', assetPath: 'tools/sickle.png', buyPrice: 30 },
    { id: 'shovel', nameKey: 'itemShovel', assetPath: 'tools/shovel.png', buyPrice: 40 },
    { id: 'sword', nameKey: 'itemSword', assetPath: 'tools/sword.png', buyPrice: 60 },
    { id: 'wateringCan', nameKey: 'itemWateringCan', assetPath: 'tools/watering_can.png', buyPrice: 55 }
] as const;

// To add a crop, add one line here and its images to the assets folder.
export const crops = [
    { id: 'beetroot', frameWidth: 16, frameHeight: 16, seedNameKey: 'seedBeetroot', harvestNameKey: 'cropBeetroot', buyPrice: 8, sellPrice: 12, stageGrowthDays: [2, 2, 2] },
    { id: 'cabbage', frameWidth: 16, frameHeight: 13, seedNameKey: 'seedCabbage', harvestNameKey: 'cropCabbage', buyPrice: 10, sellPrice: 15, stageGrowthDays: [3, 3, 3] },
    { id: 'carrot', frameWidth: 12, frameHeight: 13, seedNameKey: 'seedCarrot', harvestNameKey: 'cropCarrot', buyPrice: 5, sellPrice: 8, stageGrowthDays: [2, 2, 2] },
    { id: 'cauliflower', frameWidth: 12, frameHeight: 12, seedNameKey: 'seedCauliflower', harvestNameKey: 'cropCauliflower', buyPrice: 12, sellPrice: 18, stageGrowthDays: [4, 4, 4] },
    { id: 'kale', frameWidth: 14, frameHeight: 11, seedNameKey: 'seedKale', harvestNameKey: 'cropKale', buyPrice: 7, sellPrice: 11, stageGrowthDays: [2, 2, 2] },
    { id: 'parsnip', frameWidth: 14, frameHeight: 14, seedNameKey: 'seedParsnip', harvestNameKey: 'cropParsnip', buyPrice: 5, sellPrice: 8, stageGrowthDays: [2, 2, 2] },
    { id: 'potato', frameWidth: 11, frameHeight: 15, seedNameKey: 'seedPotato', harvestNameKey: 'cropPotato', buyPrice: 6, sellPrice: 10, stageGrowthDays: [2, 2, 2] },
    { id: 'pumpkin', frameWidth: 12, frameHeight: 14, seedNameKey: 'seedPumpkin', harvestNameKey: 'cropPumpkin', buyPrice: 15, sellPrice: 24, stageGrowthDays: [5, 4, 4] },
    { id: 'radish', frameWidth: 12, frameHeight: 15, seedNameKey: 'seedRadish', harvestNameKey: 'cropRadish', buyPrice: 6, sellPrice: 10, stageGrowthDays: [2, 2, 2] },
    { id: 'sunflower', frameWidth: 13, frameHeight: 19, seedNameKey: 'seedSunflower', harvestNameKey: 'cropSunflower', buyPrice: 10, sellPrice: 16, stageGrowthDays: [3, 3, 2] },
    { id: 'wheat', frameWidth: 13, frameHeight: 16, seedNameKey: 'seedWheat', harvestNameKey: 'cropWheat', buyPrice: 4, sellPrice: 7, stageGrowthDays: [2, 2, 2] }
] as const;

const toolItems: ToolItem[] = tools.map((tool) => ({
    id: tool.id,
    nameKey: tool.nameKey,
    type: 'tool',
    assetPath: tool.assetPath,
    textureKey: tool.id,
    maxStackSize: 1,
    buyPrice: tool.buyPrice
}));

const cropItems: GameItem[] = crops.flatMap((crop) => [
    {
        id: `${crop.id}Seed`,
        nameKey: crop.seedNameKey,
        type: 'seed',
        assetPath: `plantation/crops/${crop.id}.png`,
        textureKey: crop.id,
        textureFrame: 0,
        cropId: crop.id,
        maxStackSize: 99,
        buyPrice: crop.buyPrice,
        stageGrowthDays: crop.stageGrowthDays
    },
    {
        id: `${crop.id}Harvest`,
        nameKey: crop.harvestNameKey,
        type: 'resource',
        assetPath: `plantation/crops/${crop.id}.png`,
        textureKey: crop.id,
        textureFrame: 5,
        cropId: crop.id,
        maxStackSize: 99,
        sellPrice: crop.sellPrice
    }
]);

export const gameItems = [...toolItems, ...cropItems];
export function getItemById(itemId: ItemId): GameItem {
    return gameItems.find((item) => item.id === itemId)!;
}

export function getSeedItems(): SeedItem[] {
    return gameItems.filter((item) => item.type === 'seed') as SeedItem[];
}

export function getToolShopItems(): ToolItem[] {
    return gameItems.filter((item) => item.type === 'tool') as ToolItem[];
}

export const startingToolIds = ['sickle', 'hoe'];
export const startingSeedIds = ['carrotSeed', 'pumpkinSeed'];
