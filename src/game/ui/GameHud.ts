import { Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { EnergyService } from '../services/EnergyService';
import { InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { QuestService } from '../services/QuestService';
import { TimeService } from '../services/TimeService';
import { InventoryUi } from './InventoryUi';
import { createPixelNineSlice } from './PixelNineSlice';
import { QuestDisplay } from './QuestDisplay';

export class GameHud {
    readonly uiObjects: Phaser.GameObjects.GameObject[];

    private inventoryUi: InventoryUi;
    private moneyPanel: Phaser.GameObjects.Container;
    private timePanel: Phaser.GameObjects.Container;
    private energyPanel: Phaser.GameObjects.Container;
    private moneyLabel: Phaser.GameObjects.Text;
    private moneyText: Phaser.GameObjects.Text;
    private dayText: Phaser.GameObjects.Text;
    private clockText: Phaser.GameObjects.Text;
    private energyBar: Phaser.GameObjects.NineSlice;
    private energyLabel: Phaser.GameObjects.Text;
    private energyText: Phaser.GameObjects.Text;
    private questDisplay: QuestDisplay;

    constructor(
        scene: Scene,
        inventory: InventoryService,
        private money: MoneyService,
        private gameTime: TimeService,
        private energy: EnergyService,
        quests: QuestService,
        isInteractionBlocked: () => boolean
    ) {
        this.inventoryUi = new InventoryUi(scene, inventory, isInteractionBlocked);
        this.questDisplay = new QuestDisplay(scene, quests);

        // Money panel
        const moneyPanelBackground = createPixelNineSlice(scene, 'menuBrownDarker', 214, 48);
        const moneyCoinIcon = scene.add.image(-78, 0, 'coin').setScale(2);
        this.moneyLabel = scene.add.text(-51, -10, '', {
            fontFamily: 'Arial Black',
            fontSize: 11,
            color: '#ffe7a3',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);
        this.moneyText = scene.add.text(-51, 7, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#fff8df',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);
        this.moneyPanel = scene.add.container(122, 88, [
            moneyPanelBackground,
            moneyCoinIcon,
            this.moneyLabel,
            this.moneyText
        ]).setScrollFactor(0).setDepth(950);

        // Day and clock panel.
        const timePanelBackground = createPixelNineSlice(scene, 'menuBrownDarker', 214, 48);
        const timeSunIcon = scene.add.image(-78, 0, 'sun').setScale(2);
        this.dayText = scene.add.text(-51, -10, '', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#fff4d7',
            stroke: '#101824',
            strokeThickness: 4
        }).setOrigin(0, 0.5).setResolution(2);
        this.clockText = scene.add.text(-51, 7, '', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#101824',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);
        this.timePanel = scene.add.container(122, 142, [
            timePanelBackground,
            timeSunIcon,
            this.dayText,
            this.clockText
        ]).setScrollFactor(0).setDepth(950);

        // Energy bar
        this.energyBar = createPixelNineSlice(scene, 'energyBar', 360, 24, 3, 2, 6);
        this.energyLabel = scene.add.text(-138, 0, '', {
            fontFamily: 'Arial Black',
            fontSize: 12,
            color: '#fff8df',
            stroke: '#101f12',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);
        this.energyText = scene.add.text(168, 0, '', {
            fontFamily: 'Arial Black',
            fontSize: 13,
            color: '#ffffff',
            stroke: '#101f12',
            strokeThickness: 3
        }).setOrigin(1, 0.5).setResolution(2);
        const energyPanelBackground = createPixelNineSlice(scene, 'menuBrownDarker', 378, 42);
        const energyLightIcon = scene.add.image(-156, 0, 'light').setScale(2);
        this.energyPanel = scene.add.container(204, 35, [
            energyPanelBackground,
            this.energyBar,
            energyLightIcon,
            this.energyLabel,
            this.energyText
        ]).setScrollFactor(0).setDepth(950);

        const stopInventoryRefresh = inventory.onChange(() => this.inventoryUi.refresh());
        const stopMoneyRefresh = money.onChange(() => this.refreshMoney());
        const stopQuestRefresh = quests.onChange(() => this.questDisplay.refresh());

        scene.events.once('shutdown', () => {
            stopInventoryRefresh();
            stopMoneyRefresh();
            stopQuestRefresh();
        });

        this.uiObjects = [
            ...this.inventoryUi.uiObjects,
            this.moneyPanel,
            this.timePanel,
            this.energyPanel,
            this.questDisplay.container
        ];

        this.refresh();
    }

    update(input: GameInput): void {
        this.inventoryUi.update(input);
        this.refreshTime();
    }

    refresh(): void {
        this.inventoryUi.refresh();
        this.refreshMoney();
        this.refreshTime();
        this.refreshEnergy();
        this.questDisplay.refresh();
    }

    layout(): void {
        this.inventoryUi.layout();
        this.energyPanel.setPosition(204, 35);
        this.moneyPanel.setPosition(122, 88);
        this.timePanel.setPosition(122, 142);
        this.questDisplay.layout();
    }

    isPointerOverInventory(x: number, y: number): boolean {
        return this.inventoryUi.isPointerOverSlot(x, y);
    }

    private refreshMoney(): void {
        this.moneyLabel.setText(translate('money'));
        this.moneyText.setText(`${this.money.getBalance()} $`);
    }

    private refreshTime(): void {
        const hour = String(this.gameTime.hour).padStart(2, '0');
        const minute = String(this.gameTime.minute).padStart(2, '0');

        this.dayText.setText(`${translate('day')} ${this.gameTime.day}`);
        this.clockText.setText(`${hour}:${minute}`);
    }

    private refreshEnergy(): void {
        const energyValue = this.energy.getEnergy();
        const maxEnergy = this.energy.getMaxEnergy();

        this.energyBar.setFrame(Math.round(energyValue / maxEnergy * 6));
        this.energyLabel.setText(translate('energy'));
        this.energyText.setText(`${energyValue}/${maxEnergy}`);
    }
}
