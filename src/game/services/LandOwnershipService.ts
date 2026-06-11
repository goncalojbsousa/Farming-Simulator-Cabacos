import { TranslationKey } from './LanguageService';

export type FarmId = 'farm' | 'farm2' | 'farm3';

export type FarmPurchaseOption = {
    farmId: FarmId;
    nameKey: TranslationKey;
    price: number;
};

export const farmPurchaseOptions: readonly FarmPurchaseOption[] = [
    {
        farmId: 'farm2',
        nameKey: 'farm2Name',
        price: 50
    },
    {
        farmId: 'farm3',
        nameKey: 'farm3Name',
        price: 150
    }
];

export class LandOwnershipService {
    private ownedFarmIds = new Set<FarmId>(['farm']);

    isFarmOwned(farmId: FarmId): boolean {
        return this.ownedFarmIds.has(farmId);
    }

    buyFarm(farmId: FarmId): void {
        this.ownedFarmIds.add(farmId);
    }
}
