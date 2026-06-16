import { Scene } from 'phaser';
import { translate, TranslationKey } from '../services/LanguageService';
import { SaveService, SaveSlotInfo, saveSlotIds } from '../services/SaveService';
import { MenuPanel } from './MenuPanel';
import { createTextButton, TextButton } from './TextButton';

type LoadGameMenuConfig = {
    title: string;
    slotLabelKey: TranslationKey;
    onSelectSlot: (slotId: string) => void;
    onBack: () => void;
    depth?: number;
};

export class LoadGameMenu {
    private menu: MenuPanel;
    private slotButtons: TextButton[] = [];
    private backButton: TextButton;

    constructor(
        scene: Scene,
        private config: LoadGameMenuConfig
    ) {
        const depth = config.depth ?? 20;

        this.menu = new MenuPanel(scene, {
            width: 420,
            height: 450,
            title: config.title,
            depth
        });
        this.menu.close();

        this.slotButtons = saveSlotIds.map((slotId, index) =>
            createTextButton(
                scene,
                0,
                0,
                320,
                54,
                this.getSlotLabel(slotId),
                () => config.onSelectSlot(slotId)
            ).setName(`slotButton${index + 1}`).setVisible(false)
        );
        this.slotButtons.forEach((button) => this.menu.addContent(button));

        this.backButton = createTextButton(
            scene,
            0,
            0,
            280,
            56,
            translate('back'),
            config.onBack
        ).setVisible(false);
        this.menu.addContent(this.backButton);
    }

    open(): void {
        this.refresh();
        this.menu.open();
        this.setContentVisible(true);
    }

    close(): void {
        this.menu.close();
        this.setContentVisible(false);
    }

    isOpen(): boolean {
        return this.menu.isOpen();
    }

    layout(): void {
        this.menu.center(true);
        this.slotButtons.forEach((button, index) => {
            button.setPosition(0, -80 + index * 70);
        });
        this.backButton.setPosition(0, 150);
    }

    refresh(): void {
        this.slotButtons.forEach((button, index) => {
            button.label.setText(this.getSlotLabel(saveSlotIds[index]));
        });
    }

    private setContentVisible(visible: boolean): void {
        this.slotButtons.forEach((button) => button.setVisible(visible));
        this.backButton.setVisible(visible);
    }

    private getSlotLabel(slotId: string): string {
        const slotNumber = slotId.replace('slot', '');
        const slotInfo = SaveService.getSlotInfo(slotId);
        const prefix = translate(this.config.slotLabelKey);

        if (!slotInfo) {
            return `${prefix} ${slotNumber} - ${translate('emptySlot')}`;
        }

        return `${prefix} ${slotNumber} - ${this.formatSlotTime(slotInfo)}`;
    }

    private formatSlotTime(slotInfo: SaveSlotInfo): string {
        return `${translate('day')} ${slotInfo.day} ${slotInfo.hour.toString().padStart(2, '0')}:${slotInfo.minute.toString().padStart(2, '0')}`;
    }
}
