import { GameObjects, Scene } from 'phaser';
import { getHarvestItems, HarvestItem } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { QuestId, QuestService, QuestView } from '../services/QuestService';
import { playSound } from '../services/SoundService';
import { MenuPanel } from './MenuPanel';
import { createPixelNineSlice } from './PixelNineSlice';
import { ShopRow } from './ShopRow';

const panelWidth = 600;
const panelHeight = 540;
const panelCenterOffsetY = -56;
const tabY = -190;
const firstCropRowY = -148;
const cropRowSpacing = 35;
const firstQuestRowY = -96;
const questRowSpacing = 100;
const sellMessageY = 238;
const questMessageY = 214;

type MarketTab = 'sell' | 'quests';

type TabButton = {
    tab: MarketTab;
    background: GameObjects.NineSlice;
};

type QuestRowView = {
    questId: QuestId;
    titleText: GameObjects.Text;
    descriptionText: GameObjects.Text;
    progressText: GameObjects.Text;
    buttonBackground: GameObjects.NineSlice;
    buttonLabel: GameObjects.Text;
};

export class CropMarketPanel {
    private menu: MenuPanel;
    private sellMessage: GameObjects.Text;
    private questStatusText: GameObjects.Text;
    private activeTab: MarketTab = 'sell';
    private tabButtons: TabButton[] = [];
    private questRows: QuestRowView[] = [];
    private sellContent: GameObjects.GameObject[] = [];
    private questContent: GameObjects.GameObject[] = [];

    constructor(
        private scene: Scene,
        private inventory: InventoryService,
        private money: MoneyService,
        private quests: QuestService,
        private onMarketUpdate: () => void
    ) {
        this.menu = new MenuPanel(scene, {
            width: panelWidth,
            height: panelHeight,
            depth: 1200,
            title: translate('cropMarketTitle'),
            closeButton: true
        });

        this.menu.addContent(
            this.createTabButton('sell', translate('marketSellTab'), -76)
        );
        this.menu.addContent(
            this.createTabButton('quests', translate('marketQuestTab'), 76)
        );

        this.createSellContent();
        this.createQuestContent();
        this.setActiveTab('sell');
        this.layout();
        this.close();
    }

    toggle(): void {
        this.sellMessage.setText('');
        this.questStatusText.setText('');
        this.refreshQuestRows();
        this.menu.toggle();
    }

    close(): void {
        this.menu.close();
    }

    isOpen(): boolean {
        return this.menu.isOpen();
    }

    layout(): void {
        this.menu.center(true, panelCenterOffsetY);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.menu.container];
    }

    private createSellContent(): void {
        this.sellMessage = this.scene.add.text(0, sellMessageY, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setResolution(2);

        this.addSellObject(this.sellMessage);

        getHarvestItems().forEach((crop, index) => {
            const row = new ShopRow(
                this.scene,
                {
                    ...crop,
                    buyPrice: crop.sellPrice
                },
                firstCropRowY + index * cropRowSpacing,
                () => this.sellCrop(crop),
                translate('sell')
            );

            this.addSellObject(row.container);
        });
    }

    private createQuestContent(): void {
        for (const [index, quest] of this.quests.getQuests().entries()) {
            this.createQuestRow(quest, firstQuestRowY + index * questRowSpacing);
        }

        this.questStatusText = this.scene.add.text(0, questMessageY, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4,
            align: 'center',
            wordWrap: { width: 500 }
        }).setOrigin(0.5).setResolution(2);

        this.addQuestObject(this.questStatusText);
        this.refreshQuestRows();
    }

    private createTabButton(
        tab: MarketTab,
        label: string,
        x: number
    ): GameObjects.Container {
        const background = createPixelNineSlice(
            this.scene,
            'button',
            130,
            30,
            3,
            2,
            'trimmed'
        )
            .setPosition(x, tabY)
            .setInteractive({ useHandCursor: true });
        const text = this.scene.add.text(x, tabY - 1, label, {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0.5).setResolution(2);

        background.on('pointerover', () => {
            if (this.activeTab !== tab) {
                background.setTint(0xffd09a);
            }
        });
        background.on('pointerout', () => this.refreshTabs());
        background.on('pointerdown', () => {
            playSound(this.scene, 'select');
            this.setActiveTab(tab);
        });

        this.tabButtons.push({ tab, background });

        return this.scene.add.container(0, 0, [background, text]);
    }

    private createQuestRow(quest: QuestView, rowY: number): void {
        const rowBackground = createPixelNineSlice(this.scene, 'menuWhite', 500, 88)
            .setPosition(0, rowY);
        const iconBackground = this.scene.add.image(-214, rowY, 'shopIconBackground')
            .setScale(1.3);
        const icon = this.scene.add.image(
            -214,
            rowY,
            quest.iconTextureKey,
            quest.iconFrame
        ).setDisplaySize(30, 30);
        const titleText = this.scene.add.text(-176, rowY - 27, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#1f140b'
        }).setOrigin(0, 0.5).setResolution(2);
        const descriptionText = this.scene.add.text(-176, rowY - 2, '', {
            fontFamily: 'Verdana, Arial, sans-serif',
            fontSize: 12,
            fontStyle: 'bold',
            color: '#1f140b',
            wordWrap: { width: 270 }
        }).setOrigin(0, 0.5).setResolution(2);
        const progressText = this.scene.add.text(-176, rowY + 27, '', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#1f140b'
        }).setOrigin(0, 0.5).setResolution(2);
        const buttonBackground = createPixelNineSlice(
            this.scene,
            'button',
            128,
            32,
            3,
            2,
            'trimmed'
        )
            .setPosition(184, rowY + 10)
            .setInteractive({ useHandCursor: true });
        const buttonLabel = this.scene.add.text(184, rowY + 9, '', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0.5).setResolution(2);

        const row: QuestRowView = {
            questId: quest.id,
            titleText,
            descriptionText,
            progressText,
            buttonBackground,
            buttonLabel
        };

        buttonBackground.on('pointerover', () => {
            if (this.canClickQuest(this.quests.getQuest(quest.id))) {
                buttonBackground.setTint(0xffd09a);
            }
        });
        buttonBackground.on('pointerout', () => this.refreshQuestRow(row));
        buttonBackground.on('pointerdown', () => this.handleQuestClick(quest.id));

        this.questRows.push(row);

        for (const object of [
            rowBackground,
            iconBackground,
            icon,
            titleText,
            descriptionText,
            progressText,
            buttonBackground,
            buttonLabel
        ]) {
            this.addQuestObject(object);
        }
    }

    private setActiveTab(tab: MarketTab): void {
        this.activeTab = tab;
        this.sellMessage.setText('');
        this.questStatusText.setText('');

        this.setContentVisible(this.sellContent, tab === 'sell');
        this.setContentVisible(this.questContent, tab === 'quests');
        this.refreshTabs();

        if (tab === 'quests') {
            this.refreshQuestRows();
        }
    }

    private setContentVisible(
        objects: GameObjects.GameObject[],
        visible: boolean
    ): void {
        for (const object of objects) {
            object.setVisible(visible);
        }
    }

    private refreshTabs(): void {
        for (const tabButton of this.tabButtons) {
            if (tabButton.tab === this.activeTab) {
                tabButton.background.setTint(0xffd06a);
            } else {
                tabButton.background.clearTint();
            }
        }
    }

    private refreshQuestRows(): void {
        for (const row of this.questRows) {
            this.refreshQuestRow(row);
        }
    }

    private refreshQuestRow(row: QuestRowView): void {
        const quest = this.quests.getQuest(row.questId);

        row.titleText.setText(translate(quest.titleKey));
        row.descriptionText.setText(translate(quest.descriptionKey));
        row.progressText.setText(
            `${translate('questProgress')}: ${quest.progress}/${quest.targetAmount}`
        );
        row.buttonBackground.clearTint().setAlpha(1);

        if (quest.isCompleted) {
            row.buttonLabel.setText(translate('questCompleted'));
            row.buttonBackground.setTint(0x8f8176).setAlpha(0.85);
            return;
        }

        if (!quest.isActive) {
            row.buttonLabel.setText(translate('questActivate'));
            if (this.quests.hasActiveQuest()) {
                row.buttonBackground.setTint(0x8f8176).setAlpha(0.85);
            }
            return;
        }

        if (quest.isReadyToClaim) {
            row.buttonLabel.setText(translate('questClaim'));
            row.buttonBackground.setTint(0xffd06a);
            return;
        }

        row.buttonLabel.setText(translate('questInProgress'));
        row.buttonBackground.setTint(0x8f8176).setAlpha(0.85);
    }

    private canClickQuest(quest: QuestView): boolean {
        if (quest.isCompleted) {
            return false;
        }

        if (!quest.isActive) {
            return !this.quests.hasActiveQuest();
        }

        return quest.isReadyToClaim;
    }

    private handleQuestClick(questId: QuestId): void {
        const quest = this.quests.getQuest(questId);

        if (quest.isCompleted) {
            return;
        }

        if (!quest.isActive) {
            const wasActivated = this.quests.activateQuest(questId);

            if (!wasActivated) {
                this.questStatusText.setText(translate('questAlreadyActive'));
                this.refreshQuestRows();
                playSound(this.scene, 'fail');
                return;
            }

            this.questStatusText.setText(
                `${translate('questActivated')}: ${translate(quest.titleKey)}`
            );
            this.refreshQuestRows();
            playSound(this.scene, 'select');
            this.onMarketUpdate();
            return;
        }

        if (!quest.isReadyToClaim) {
            this.questStatusText.setText(translate('questNotReady'));
            playSound(this.scene, 'fail');
            return;
        }

        const reward = this.quests.claimReward(questId);

        if (reward === 0) {
            this.questStatusText.setText(translate('questNotReady'));
            playSound(this.scene, 'fail');
            return;
        }

        this.money.earn(reward);
        this.refreshQuestRows();
        this.questStatusText.setText(
            `${translate('questRewardClaimed')}: +${reward} $`
        );
        playSound(this.scene, 'purchaseClick');
        this.onMarketUpdate();
    }

    private addSellObject(gameObject: GameObjects.GameObject): void {
        this.menu.addContent(gameObject);
        this.sellContent.push(gameObject);
    }

    private addQuestObject(gameObject: GameObjects.GameObject): void {
        this.menu.addContent(gameObject);
        this.questContent.push(gameObject);
    }

    private sellCrop(crop: HarvestItem): void {
        if (!this.inventory.removeOneItem(crop.id, this.inventory.selectedSlotIndex)) {
            this.sellMessage.setText(translate('noCropToSell'));
            playSound(this.scene, 'fail');
            return;
        }

        this.money.earn(crop.sellPrice);

        if (crop.cropId) {
            this.quests.sellCrop(crop.cropId);
        }

        this.refreshQuestRows();
        playSound(this.scene, 'sell');
        this.onMarketUpdate();
        this.sellMessage.setText(
            `${translate('sold')} ${translate(crop.nameKey)}`
        );
    }
}
