import { GameObjects, Scene } from 'phaser';
import {
    farmPurchaseOptions,
    FarmPurchaseOption,
    LandOwnershipService
} from '../services/LandOwnershipService';
import { translate } from '../services/LanguageService';
import { MoneyService } from '../services/MoneyService';
import { playSound } from '../services/SoundService';
import { MenuPanel } from './MenuPanel';
import { createPixelNineSlice } from './PixelNineSlice';

type FarmRowView = {
    farmOption: FarmPurchaseOption;
    priceText: GameObjects.Text;
    buttonBackground: GameObjects.NineSlice;
    buttonLabel: GameObjects.Text;
};

export class FarmPurchasePanel {
    readonly container: GameObjects.Container;

    private menu: MenuPanel;
    private statusMessage: GameObjects.Text;
    private farmRows: FarmRowView[] = [];

    constructor(
        private scene: Scene,
        private money: MoneyService,
        private landOwnership: LandOwnershipService,
        private onPurchase: () => void
    ) {
        this.menu = new MenuPanel(scene, {
            width: 560,
            height: 360,
            title: translate('farmPurchaseTitle'),
            depth: 1200,
            closeButton: true
        });
        this.container = this.menu.container;

        this.statusMessage = scene.add.text(0, 135, '', {
            fontFamily: 'Arial',
            fontSize: 16,
            color: '#ffe7a3',
            align: 'center',
            wordWrap: { width: 430 }
        }).setOrigin(0.5);

        this.menu.addContent(this.statusMessage);

        farmPurchaseOptions.forEach((farmOption, index) => {
            this.menu.addContent(this.createFarmRow(farmOption, -40 + index * 82));
        });

        this.layout();
        this.close();
    }

    toggle(): void {
        this.statusMessage.setText('');
        this.refreshRows();
        this.menu.toggle();
    }

    close(): void {
        this.menu.close();
    }

    isOpen(): boolean {
        return this.menu.isOpen();
    }

    layout(): void {
        this.menu.center(true);
    }

    private createFarmRow(
        farmOption: FarmPurchaseOption,
        rowY: number
    ): GameObjects.Container {
        const rowBackground = createPixelNineSlice(
            this.scene,
            'menuWhite',
            460,
            64
        ).setAlpha(0.95);
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

        const buttonBackground = createPixelNineSlice(
            this.scene,
            'button',
            118,
            34,
            3,
            2,
            'trimmed'
        )
            .setPosition(166, 0)
            .setInteractive({ useHandCursor: true });

        const buttonLabel = this.scene.add.text(166, 0, translate('buy'), {
            fontFamily: 'Arial Black',
            fontSize: 15,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 2
        }).setOrigin(0.5).setResolution(2);

        const row: FarmRowView = {
            farmOption,
            priceText,
            buttonBackground,
            buttonLabel
        };

        buttonBackground.on('pointerover', () => {
            if (!this.landOwnership.isFarmOwned(farmOption.farmId)) {
                buttonBackground.setTint(0xffd09a);
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
            playSound(this.scene, 'fail');
            return;
        }

        if (!this.money.canAfford(farmOption.price)) {
            this.statusMessage.setText(translate('notEnoughMoney'));
            playSound(this.scene, 'fail');
            return;
        }

        this.money.spend(farmOption.price);
        this.landOwnership.buyFarm(farmOption.farmId);
        playSound(this.scene, 'buyLand');
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
        row.buttonBackground
            .clearTint()
            .setAlpha(1);

        if (isOwned) {
            row.buttonBackground
                .setTint(0x8f8176)
                .setAlpha(0.85);
        }
    }

    private createFarmIcon(x: number, y: number): GameObjects.Image {
        return this.scene.add.image(x, y, 'land').setScale(2);
    }

    private createCoinIcon(x: number, y: number): GameObjects.Image {
        return this.scene.add.image(x, y, 'coin').setScale(1.5);
    }
}
