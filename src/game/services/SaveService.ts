import type { InventorySnapshot } from './InventoryService';
import type { FarmId } from './LandOwnershipService';
import type { TimeSnapshot } from './TimeService';
import type { SavedFarmingState } from '../systems/FarmingSystem';

const savePrefix = 'farming-simulator-cabacos-save-';
const currentSlotKey = 'farming-simulator-cabacos-current-slot';
const defaultSlotId = 'slot1';

export const saveSlotIds = ['slot1', 'slot2', 'slot3'] as const;

export type SaveSlotInfo = {
    day: number;
    hour: number;
    minute: number;
};

export type SaveGameData = {
    version: 1;
    savedAt: string;
    playerPosition?: {
        x: number;
        y: number;
    };
    inventory: InventorySnapshot;
    time: TimeSnapshot;
    money: number;
    energy: number;
    wateringCanWater: number;
    unlockedFarmIds: FarmId[];
    farming: SavedFarmingState;
};

export class SaveService {
    static getCurrentSlot(): string {
        return localStorage.getItem(currentSlotKey) ?? defaultSlotId;
    }

    static setCurrentSlot(slotId: string): void {
        localStorage.setItem(currentSlotKey, slotId);
    }

    static saveCurrentSlot(save: SaveGameData): void {
        this.save(this.getCurrentSlot(), save);
    }

    static save(slotId: string, save: SaveGameData): void {
        localStorage.setItem(this.getStorageKey(slotId), JSON.stringify(save));
        this.setCurrentSlot(slotId);
    }

    static load(slotId: string): SaveGameData | null {
        const rawSave = localStorage.getItem(this.getStorageKey(slotId));

        if (!rawSave) {
            return null;
        }

        try {
            return JSON.parse(rawSave) as SaveGameData;
        } catch {
            return null;
        }
    }

    static getSlotInfo(slotId: string): SaveSlotInfo | null {
        const save = this.load(slotId);

        if (!save) {
            return null;
        }

        return {
            day: save.time.day,
            hour: save.time.hour,
            minute: save.time.minute
        };
    }

    private static getStorageKey(slotId: string): string {
        return `${savePrefix}${slotId}`;
    }
}
