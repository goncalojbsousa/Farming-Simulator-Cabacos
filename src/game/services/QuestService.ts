import type { CropId } from '../data/ItemData';
import type { TranslationKey } from './LanguageService';

export type QuestId = 'plantPumpkins' | 'sellCarrots' | 'waterPlants';

export type QuestSavedState = {
    isActive?: boolean;
    progress?: number;
    plantedAmount?: number;
    rewardClaimed?: boolean;
};

export type QuestSnapshot = Partial<Record<QuestId, QuestSavedState>>;

export type QuestDefinition = {
    id: QuestId;
    titleKey: TranslationKey;
    descriptionKey: TranslationKey;
    iconTextureKey: string;
    iconFrame?: number;
    targetAmount: number;
    reward: number;
};

type QuestState = {
    isActive: boolean;
    progress: number;
    rewardClaimed: boolean;
};

export type QuestView = QuestDefinition & QuestState & {
    isReadyToClaim: boolean;
    isCompleted: boolean;
};

export const questDefinitions: QuestDefinition[] = [
    {
        id: 'plantPumpkins',
        titleKey: 'questPlantPumpkinsTitle',
        descriptionKey: 'questPlantPumpkinsDescription',
        iconTextureKey: 'pumpkin',
        iconFrame: 5,
        targetAmount: 3,
        reward: 75
    },
    {
        id: 'sellCarrots',
        titleKey: 'questSellCarrotsTitle',
        descriptionKey: 'questSellCarrotsDescription',
        iconTextureKey: 'carrot',
        iconFrame: 5,
        targetAmount: 3,
        reward: 60
    },
    {
        id: 'waterPlants',
        titleKey: 'questWaterPlantsTitle',
        descriptionKey: 'questWaterPlantsDescription',
        iconTextureKey: 'wateringCan',
        targetAmount: 10,
        reward: 50
    }
];

export class QuestService {
    private questStates = new Map<QuestId, QuestState>();
    private changeCallbacks: (() => void)[] = [];

    constructor() {
        for (const quest of questDefinitions) {
            this.questStates.set(quest.id, {
                isActive: false,
                progress: 0,
                rewardClaimed: false
            });
        }
    }

    activateQuest(questId: QuestId): boolean {
        const state = this.getState(questId);

        if (state.isActive || state.rewardClaimed || this.hasActiveQuest()) {
            return false;
        }

        state.isActive = true;
        state.progress = 0;
        this.notifyChange();
        return true;
    }

    plantCrop(cropId: CropId): void {
        if (cropId === 'pumpkin') {
            this.addProgress('plantPumpkins');
        }
    }

    sellCrop(cropId: CropId): void {
        if (cropId === 'carrot') {
            this.addProgress('sellCarrots');
        }
    }

    waterPlant(): void {
        this.addProgress('waterPlants');
    }

    claimReward(questId: QuestId): number {
        const quest = this.getQuest(questId);

        if (!quest.isReadyToClaim) {
            return 0;
        }

        const state = this.getState(questId);
        state.rewardClaimed = true;
        state.isActive = false;
        this.notifyChange();

        return quest.reward;
    }

    getQuest(questId: QuestId): QuestView {
        const definition = this.getDefinition(questId);
        const state = this.getState(questId);
        const progress = Math.min(state.progress, definition.targetAmount);

        return {
            ...definition,
            isActive: state.isActive,
            progress,
            rewardClaimed: state.rewardClaimed,
            isReadyToClaim: state.isActive
                && progress >= definition.targetAmount
                && !state.rewardClaimed,
            isCompleted: state.rewardClaimed
        };
    }

    getQuests(): QuestView[] {
        return questDefinitions.map((quest) => this.getQuest(quest.id));
    }

    getActiveQuests(): QuestView[] {
        return this.getQuests().filter((quest) =>
            quest.isActive && !quest.isCompleted
        );
    }

    hasActiveQuest(): boolean {
        return this.getActiveQuests().length > 0;
    }

    getSnapshot(): QuestSnapshot {
        const snapshot: QuestSnapshot = {};

        for (const quest of questDefinitions) {
            const state = this.getState(quest.id);

            snapshot[quest.id] = {
                isActive: state.isActive,
                progress: state.progress,
                rewardClaimed: state.rewardClaimed
            };
        }

        return snapshot;
    }

    loadSnapshot(snapshot: QuestSnapshot): void {
        for (const quest of questDefinitions) {
            const savedState = snapshot[quest.id];

            if (!savedState) {
                continue;
            }

            const state = this.getState(quest.id);
            state.isActive = savedState.isActive ?? false;
            state.progress = savedState.progress ?? savedState.plantedAmount ?? 0;
            state.rewardClaimed = savedState.rewardClaimed ?? false;
        }

        this.notifyChange();
    }

    onChange(callback: () => void): () => void {
        this.changeCallbacks.push(callback);

        return () => {
            this.changeCallbacks = this.changeCallbacks.filter((savedCallback) =>
                savedCallback !== callback
            );
        };
    }

    private addProgress(questId: QuestId): void {
        const quest = this.getQuest(questId);
        const state = this.getState(questId);

        if (!quest.isActive || quest.isCompleted || quest.isReadyToClaim) {
            return;
        }

        state.progress++;
        this.notifyChange();
    }

    private getDefinition(questId: QuestId): QuestDefinition {
        return questDefinitions.find((quest) => quest.id === questId)!;
    }

    private getState(questId: QuestId): QuestState {
        return this.questStates.get(questId)!;
    }

    private notifyChange(): void {
        for (const callback of this.changeCallbacks) {
            callback();
        }
    }
}
