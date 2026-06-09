import type { TranslationKey } from '../services/LanguageService';

export type ItemType = 'tool' | 'resource' | 'seed';

type Tool = {
    id: string;
    nameKey: TranslationKey;
};

type Crop = {
    id: string;
    seedNameKey: TranslationKey;
    harvestNameKey: TranslationKey;
    buyPrice: number;
    sellPrice: number;
};

export type GameItem = {
    id: ItemId;
    nameKey: TranslationKey;
    type: ItemType;
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
};

const tools = [
    { id: 'axe', nameKey: 'itemAxe' },
    { id: 'hammer', nameKey: 'itemHammer' },
    { id: 'pickaxe', nameKey: 'itemPickaxe' },
    { id: 'rod', nameKey: 'itemRod' },
    { id: 'shovel', nameKey: 'itemShovel' },
    { id: 'sword', nameKey: 'itemSword' }
] as const satisfies readonly Tool[];

// Add a new crops here. Its seed and harvest items are created automatically.
export const crops = [
    { id: 'beetroot', seedNameKey: 'seedBeetroot', harvestNameKey: 'cropBeetroot', buyPrice: 8, sellPrice: 12 },
    { id: 'cabbage', seedNameKey: 'seedCabbage', harvestNameKey: 'cropCabbage', buyPrice: 10, sellPrice: 15 },
    { id: 'carrot', seedNameKey: 'seedCarrot', harvestNameKey: 'cropCarrot', buyPrice: 5, sellPrice: 8 },
    { id: 'cauliflower', seedNameKey: 'seedCauliflower', harvestNameKey: 'cropCauliflower', buyPrice: 12, sellPrice: 18 },
    { id: 'kale', seedNameKey: 'seedKale', harvestNameKey: 'cropKale', buyPrice: 7, sellPrice: 11 },
    { id: 'parsnip', seedNameKey: 'seedParsnip', harvestNameKey: 'cropParsnip', buyPrice: 5, sellPrice: 8 },
    { id: 'potato', seedNameKey: 'seedPotato', harvestNameKey: 'cropPotato', buyPrice: 6, sellPrice: 10 },
    { id: 'pumpkin', seedNameKey: 'seedPumpkin', harvestNameKey: 'cropPumpkin', buyPrice: 15, sellPrice: 24 },
    { id: 'radish', seedNameKey: 'seedRadish', harvestNameKey: 'cropRadish', buyPrice: 6, sellPrice: 10 },
    { id: 'sunflower', seedNameKey: 'seedSunflower', harvestNameKey: 'cropSunflower', buyPrice: 10, sellPrice: 16 },
    { id: 'wheat', seedNameKey: 'seedWheat', harvestNameKey: 'cropWheat', buyPrice: 4, sellPrice: 7 }
] as const satisfies readonly Crop[];

export type ToolId = typeof tools[number]['id'];
export type CropId = typeof crops[number]['id'];
export type SeedItemId = `${CropId}Seed`;
export type HarvestItemId = `${CropId}Harvest`;
export type ItemId = ToolId | SeedItemId | HarvestItemId;

export const cropStages = [1, 2, 3, 4] as const;
export type CropStage = typeof cropStages[number];

const toolItems: GameItem[] = tools.map((tool) => ({
    id: tool.id,
    nameKey: tool.nameKey,
    type: 'tool',
    assetPath: `tools/${tool.id}.png`,
    maxStackSize: 1
}));

const cropItems: GameItem[] = crops.flatMap((crop) => [
    {
        id: `${crop.id}Seed` as SeedItemId,
        nameKey: crop.seedNameKey,
        type: 'seed',
        assetPath: `plantation/crops/${crop.id}_00.png`,
        cropId: crop.id,
        maxStackSize: 99,
        buyPrice: crop.buyPrice
    },
    {
        id: `${crop.id}Harvest` as HarvestItemId,
        nameKey: crop.harvestNameKey,
        type: 'resource',
        assetPath: `plantation/crops/${crop.id}_05.png`,
        maxStackSize: 99,
        sellPrice: crop.sellPrice
    }
]);

export const gameItems: readonly GameItem[] = [...toolItems, ...cropItems];

export function getItemById(itemId: ItemId): GameItem {
    const item = gameItems.find((gameItem) => gameItem.id === itemId);

    if (!item) {
        throw new Error(`Unknown item: ${itemId}`);
    }

    return item;
}

export function getAllItems(): readonly GameItem[] {
    return gameItems;
}

export function isSeedItem(item: GameItem): item is SeedItem {
    return item.type === 'seed'
        && item.cropId !== undefined
        && item.buyPrice !== undefined;
}

export function getSeedItems(): SeedItem[] {
    return gameItems.filter(isSeedItem);
}

export function getCropTextureKey(cropId: CropId, stage: CropStage): string {
    return `${cropId}_${String(stage).padStart(2, '0')}`;
}

export function getCropAssetPath(cropId: CropId, stage: CropStage): string {
    return `plantation/crops/${getCropTextureKey(cropId, stage)}.png`;
}

export function getStartingItemIds(): ItemId[] {
    return ['axe', 'pickaxe', 'shovel', 'hammer', 'rod', 'sword'];
}

export function getStartingSeedItemIds(): ItemId[] {
    return ['carrotSeed', 'potatoSeed', 'wheatSeed', 'pumpkinSeed'];
}
