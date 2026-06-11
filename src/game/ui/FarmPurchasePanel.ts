import { GameObjects, Scene } from 'phaser';
import {
    farmPurchaseOptions,
    FarmPurchaseOption,
    LandOwnershipService
} from '../services/LandOwnershipService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';

type FarmRowView = {
    farmOption: FarmPurchaseOption;
    priceText: GameObjects.Text;
    buttonBackground: GameObjects.Rectangle;
    buttonLabel: GameObjects.Text;
};

export class FarmPurchasePanel {
    private rootContainer: GameObjects.Container;
    private panelContainer: GameObjects.Container;
    private overlay: GameObjects.Rectangle;
    private statusMessage: GameObjects.Text;
    private farmRows: FarmRowView[] = [];

    constructor(
        private scene: Scene,
        private money: MoneyService,
        private landOwnership: LandOwnershipService,
        private onPurchase: () => void
    ) {
        this.overlay = scene.add.rectangle(0, 0, 1, 1, 0x000000, 0.45)
            .setOrigin(0)
            .setInteractive();

        this.panelContainer = scene.add.container(0, 0);
        this.rootContainer = scene.add.container(0, 0, [
            this.overlay,
            this.panelContainer
        ])
            .setScrollFactor(0)
            .setDepth(1200);

        this.createPanelFrame();
        this.createTitle();

        this.statusMessage = scene.add.text(0, 135, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffe7a3',
            align: 'center',
            wordWrap: { width: 430 }
        }).setOrigin(0.5);

        this.panelContainer.add(this.statusMessage);
        this.panelContainer.add(this.createCloseButton());

        farmPurchaseOptions.forEach((farmOption, index) => {
            this.panelContainer.add(this.createFarmRow(farmOption, -40 + index * 82));
        });

        this.layout();
        this.close();
    }

    toggle(): void {
        this.statusMessage.setText('');
        this.refreshRows();
        this.rootContainer.setVisible(!this.rootContainer.visible);
    }

    close(): void {
        this.rootContainer.setVisible(false);
    }

    isOpen(): boolean {
        return this.rootContainer.visible;
    }

    layout(): void {
        const { width, height } = this.scene.scale;
        const panelWidth = 560;
        const panelHeight = 360;
        const panelScale = Math.min(1, (width - 24) / panelWidth, (height - 24) / panelHeight);

        this.overlay.setDisplaySize(width, height);
        this.panelContainer
            .setPosition(width / 2, height / 2)
            .setScale(panelScale);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.rootContainer];
    }

    private createPanelFrame(): void {
        const panelShadow = this.scene.add.rectangle(8, 10, 560, 360, 0x000000, 0.28);
        const woodFrame = this.scene.add.rectangle(0, 0, 560, 360, 0x6b4428)
            .setStrokeStyle(4, 0x332015);
        const innerPanel = this.scene.add.rectangle(0, 8, 512, 300, 0x1f3328, 0.98)
            .setStrokeStyle(3, 0xe3a35a);
        const topWoodTrim = this.scene.add.rectangle(0, -148, 520, 28, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);
        const bottomWoodTrim = this.scene.add.rectangle(0, 154, 520, 28, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);

        this.panelContainer.add([
            panelShadow,
            woodFrame,
            innerPanel,
            topWoodTrim,
            bottomWoodTrim
        ]);
    }

    private createTitle(): void {
        const titleBackground = this.scene.add.rectangle(0, -126, 350, 48, 0x5a3822)
            .setStrokeStyle(3, 0xe3a35a);
        const title = this.scene.add.text(0, -126, translate('farmPurchaseTitle'), {
            fontFamily: 'Arial Black',
            fontSize: 24,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 4
        }).setOrigin(0.5);

        this.panelContainer.add([titleBackground, title]);
    }

    private createCloseButton(): GameObjects.Container {
        const background = this.scene.add.rectangle(240, -144, 34, 30, 0x6b2f26)
            .setStrokeStyle(2, 0xffe3a3)
            .setInteractive({ useHandCursor: true });
        const label = this.scene.add.text(240, -145, 'X', {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#ffffff'
        }).setOrigin(0.5);

        background.on('pointerover', () => background.setFillStyle(0x8d3d30));
        background.on('pointerout', () => background.setFillStyle(0x6b2f26));
        background.on('pointerdown', () => this.close());

        return this.scene.add.container(0, 0, [background, label]);
    }

    private createFarmRow(
        farmOption: FarmPurchaseOption,
        rowY: number
    ): GameObjects.Container {
        const rowBackground = this.scene.add.rectangle(0, 0, 460, 64, 0x263f30, 0.95)
            .setStrokeStyle(2, 0x8b6b3f);
        const farmIcon = this.createFarmIcon(-188, 0);
        const farmName = this.scene.add.text(-155, -7, translate(farmOption.nameKey), {
            fontFamily: 'Arial Black',
            fontSize: 18,
            color: '#fff4d7'
        }).setOrigin(0, 0.5);

        const coinIcon = this.createCoinIcon(30, 0);
        const priceText = this.scene.add.text(55, 0, `${farmOption.price}$`, {
            fontFamily: 'Arial Black',
            fontSize: 17,
            color: '#ffe7a3'
        }).setOrigin(0, 0.5);

        const buttonBackground = this.scene.add.rectangle(166, 0, 118, 34, 0x2f6d38)
            .setStrokeStyle(2, 0xfff1c9)
            .setInteractive({ useHandCursor: true });

        const buttonLabel = this.scene.add.text(166, 0, translate('buy'), {
            fontFamily: 'Arial Black',
            fontSize: 15,
            color: '#ffffff'
        }).setOrigin(0.5);

        const row: FarmRowView = {
            farmOption,
            priceText,
            buttonBackground,
            buttonLabel
        };

        buttonBackground.on('pointerover', () => {
            if (!this.landOwnership.isFarmOwned(farmOption.farmId)) {
                buttonBackground.setFillStyle(0x3f7a39);
            }
        });

        buttonBackground.on('pointerout', () => this.refreshRow(row));
        buttonBackground.on('pointerdown', () => this.buyFarm(farmOption));

        this.farmRows.push(row);
        this.refreshRow(row);

        return this.scene.add.container(0, rowY, [
            rowBackground,
            farmIcon,
            farmName,
            coinIcon,
            priceText,
            buttonBackground,
            buttonLabel
        ]);
    }

    private buyFarm(farmOption: FarmPurchaseOption): void {
        if (this.landOwnership.isFarmOwned(farmOption.farmId)) {
            this.statusMessage.setText(translate('alreadyOwned'));
            return;
        }

        if (!this.money.canAfford(farmOption.price)) {
            this.statusMessage.setText(translate('notEnoughMoney'));
            return;
        }

        this.money.spend(farmOption.price);
        this.landOwnership.buyFarm(farmOption.farmId);
        this.onPurchase();
        this.refreshRows();
        this.statusMessage.setText(
            `${translate('landPurchased')} ${translate(farmOption.nameKey)}`
        );
    }

    private refreshRows(): void {
        for (const row of this.farmRows) {
            this.refreshRow(row);
        }
    }

    private refreshRow(row: FarmRowView): void {
        const isOwned = this.landOwnership.isFarmOwned(row.farmOption.farmId);
        row.priceText.setText(`${row.farmOption.price}$`);
        row.buttonLabel.setText(isOwned ? translate('owned') : translate('buy'));
        row.buttonBackground.setFillStyle(isOwned ? 0x58615b : 0x2f6d38);
    }

    private createFarmIcon(x: number, y: number): GameObjects.Container {
        const soil = this.scene.add.rectangle(x, y + 5, 34, 24, 0x8a5a31)
            .setStrokeStyle(2, 0x4a2e1d);
        const fieldLineOne = this.scene.add.rectangle(x, y + 3, 26, 3, 0xd49b5c);
        const fieldLineTwo = this.scene.add.rectangle(x, y + 10, 22, 3, 0xd49b5c);
        const sproutStem = this.scene.add.rectangle(x, y - 8, 3, 14, 0x4f8d3b);
        const sproutLeft = this.scene.add.ellipse(x - 6, y - 11, 12, 7, 0x6abf4b);
        const sproutRight = this.scene.add.ellipse(x + 6, y - 11, 12, 7, 0x6abf4b);

        return this.scene.add.container(0, 0, [
            soil,
            fieldLineOne,
            fieldLineTwo,
            sproutStem,
            sproutLeft,
            sproutRight
        ]);
    }

    private createCoinIcon(x: number, y: number): GameObjects.Container {
        const coin = this.scene.add.circle(x, y, 10, 0xd6a84f)
            .setStrokeStyle(2, 0xffe7a3);
        const shine = this.scene.add.circle(x - 3, y - 3, 2, 0xfff1c9);

        return this.scene.add.container(0, 0, [coin, shine]);
    }
}
