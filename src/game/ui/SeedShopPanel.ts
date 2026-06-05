import { GameObjects, Scene } from 'phaser';
import { SeedItem, getSeedItems } from '../data/ItemData';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { translate } from '../services/LanguageService';

type SeedShopPanelConfig = {
    scene: Scene;
    inventory: InventoryService;
    money: MoneyService;
    onInventoryChanged: () => void;
    onMoneyChanged: () => void;
};

const panelWidth = 560;
const panelHeight = 570;

export class SeedShopPanel {
    private panelContainer: GameObjects.Container;
    private statusMessageText: GameObjects.Text;
    private panelIsOpen = false;

    constructor(private config: SeedShopPanelConfig) {
        const { scene } = config;

        const panelBackground = scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x1f2d24, 0.96)
            .setStrokeStyle(4, 0xe2a36f);

        const titleText = scene.add.text(0, -250, 'Loja de Sementes', {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.statusMessageText = scene.add.text(0, 255, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffe7a3'
        }).setOrigin(0.5);

        const closeButton = scene.add.text(250, -255, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 20,
            color: '#ffffff'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => this.close());

        this.panelContainer = scene.add.container(
            0,
            0,
            [panelBackground, titleText, this.statusMessageText, closeButton]
        )
            .setScrollFactor(0)
            .setDepth(1200);

        getSeedItems().forEach((seed, rowIndex) => {
            this.panelContainer.add(this.createSeedRow(seed, -190 + rowIndex * 40));
        });

        this.layout();
        this.close();
    }

    open(): void {
        this.panelIsOpen = true;
        this.statusMessageText.setText('');
        this.panelContainer.setVisible(true);
    }

    close(): void {
        this.panelIsOpen = false;
        this.panelContainer.setVisible(false);
    }

    toggle(): void {
        this.panelIsOpen ? this.close() : this.open();
    }

    isOpen(): boolean {
        return this.panelIsOpen;
    }

    // Exposes the panel so Game can render it only through the fixed UI camera.
    getGameObjects(): GameObjects.GameObject[] {
        return [this.panelContainer];
    }

    // Checks whether UI input should block interactions with the game world.
    containsScreenPoint(x: number, y: number): boolean {
        return this.panelIsOpen && this.panelContainer.getBounds().contains(x, y);
    }

    // Keeps the panel centred and scales it down when the viewport is too small.
    layout(): void {
        const { width, height } = this.config.scene.scale;
        const panelScale = Math.min(1, (width - 24) / panelWidth, (height - 24) / panelHeight);

        this.panelContainer.setPosition(width / 2, height / 2).setScale(panelScale);
    }

    private createSeedRow(seed: SeedItem, rowY: number): GameObjects.Container {
        const { scene } = this.config;
        const seedIcon = scene.add.image(-240, 0, seed.id).setDisplaySize(24, 24);
        const seedNameText = scene.add.text(-216, 0, translate(seed.nameKey), {
            fontFamily: 'Arial',
            fontSize: 15,
            color: '#ffffff'
        }).setOrigin(0, 0.5);
        const priceText = scene.add.text(120, 0, `${seed.buyPrice}$`, {
            fontFamily: 'Arial Black',
            fontSize: 15,
            color: '#ffe7a3'
        }).setOrigin(1, 0.5);

        return scene.add.container(
            0,
            rowY,
            [seedIcon, seedNameText, priceText, this.createBuyButton(seed)]
        );
    }

    private createBuyButton(seed: SeedItem): GameObjects.Container {
        const { scene } = this.config;
        const buttonBackground = scene.add.rectangle(188, 0, 88, 28, 0x2f5d2c)
            .setStrokeStyle(2, 0xffffff)
            .setInteractive({ useHandCursor: true });
        const buttonText = scene.add.text(188, 0, 'Comprar', {
            fontFamily: 'Arial',
            fontSize: 14,
            color: '#ffffff'
        }).setOrigin(0.5);

        buttonBackground.on('pointerover', () => buttonBackground.setFillStyle(0x3f7a39));
        buttonBackground.on('pointerout', () => buttonBackground.setFillStyle(0x2f5d2c));
        buttonBackground.on('pointerdown', () => this.buySeed(seed));

        return scene.add.container(0, 0, [buttonBackground, buttonText]);
    }

    private buySeed(seed: SeedItem): void {
        const { inventory, money, onInventoryChanged, onMoneyChanged } = this.config;
        const seedPrice = seed.buyPrice;

        if (!money.canAfford(seedPrice)) {
            this.statusMessageText.setText('Dinheiro insuficiente');
            return;
        }

        if (inventory.addItem(seed.id, 1) > 0) {
            this.statusMessageText.setText('Inventario cheio');
            return;
        }

        money.spend(seedPrice);
        onInventoryChanged();
        onMoneyChanged();
        this.statusMessageText.setText(`Compraste ${translate(seed.nameKey)}`);
    }
}
