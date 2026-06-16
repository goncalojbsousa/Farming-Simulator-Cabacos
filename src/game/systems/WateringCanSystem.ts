import { GameObjects, Geom, Scene } from 'phaser';
import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { hotbarSlotCount, InventoryService } from '../services/InventoryService';
import { translate } from '../services/LanguageService';
import { playSound } from '../services/SoundService';
import { WateringCanService } from '../services/WateringCanService';
import { InteractionPrompt } from '../ui/InteractionPrompt';

const fillWateringCanAction = 'fill_watering_can';
const hotbarSlotSize = 20;
const hotbarSlotScale = 3;
const hotbarSlotGap = 6;
const waterTextHotbarMargin = 14;
const wellInteractionPadding = 14;

type WateringCanSystemConfig = {
    scene: Scene;
    map: Phaser.Tilemaps.Tilemap;
    player: Player;
    inventory: InventoryService;
    wateringCan: WateringCanService;
};

export class WateringCanSystem {
    readonly uiObjects: GameObjects.GameObject[];

    private wellZones: Geom.Rectangle[] = [];
    private prompt: InteractionPrompt;
    private waterText: GameObjects.Text;

    constructor(private config: WateringCanSystemConfig) {
        this.createWellZones();

        this.prompt = new InteractionPrompt(config.scene, translate('fillWateringCan'));
        this.prompt.container.setScrollFactor(0);

        this.waterText = config.scene.add.text(0, 0, '', {
            fontFamily: 'Arial Black',
            fontSize: 15,
            color: '#dff7ff',
            stroke: '#10222d',
            strokeThickness: 4
        })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1000)
            .setResolution(2)
            .setVisible(false);

        this.uiObjects = [
            this.prompt.container,
            this.waterText
        ];

        this.layout();
    }

    update(input: GameInput): void {
        const hasWateringCanSelected = this.isWateringCanSelected();
        const wateringCanHotbarSlot = this.getWateringCanHotbarSlot();

        this.updateWaterText(hasWateringCanSelected, wateringCanHotbarSlot);

        const currentWell = hasWateringCanSelected
            ? this.getCurrentWellZone()
            : undefined;

        if (currentWell) {
            this.prompt.show();
        } else {
            this.prompt.hide();
        }

        if (currentWell && input.interactPressed()) {
            const wasFull = this.config.wateringCan.getWater()
                === this.config.wateringCan.getMaxWater();

            this.config.wateringCan.fill();
            this.updateWaterText(true, wateringCanHotbarSlot);

            if (!wasFull) {
                playSound(this.config.scene, 'getWater');
            }
        }
    }

    layout(): void {
        this.prompt.container.setPosition(
            this.config.scene.scale.width / 2,
            this.config.scene.scale.height - 150
        );
        this.positionWaterText(this.getWateringCanHotbarSlot());
    }

    private createWellZones(): void {
        const objects = this.config.map.getObjectLayer('Interactions')?.objects ?? [];

        this.wellZones = objects
            .filter((object) => object.properties?.some((property: { name?: string; value?: unknown }) =>
                property.name === 'action' && property.value === fillWateringCanAction
            ))
            .map((object) => new Geom.Rectangle(
                (object.x ?? 0) - wellInteractionPadding,
                (object.y ?? 0) - wellInteractionPadding,
                (object.width ?? 0) + wellInteractionPadding * 2,
                (object.height ?? 0) + wellInteractionPadding * 2
            ));
    }

    private isWateringCanSelected(): boolean {
        const selectedSlot = this.config.inventory.slots[
            this.config.inventory.selectedSlotIndex
        ];

        return selectedSlot.itemId === 'wateringCan';
    }

    private updateWaterText(isVisible: boolean, slotIndex: number | null): void {
        this.waterText
            .setText(
                `${translate('water')}: ${this.config.wateringCan.getWater()}/${this.config.wateringCan.getMaxWater()}`
            )
            .setVisible(isVisible && slotIndex !== null);

        this.positionWaterText(slotIndex);
    }

    private positionWaterText(slotIndex: number | null): void {
        if (slotIndex === null) {
            return;
        }

        const scaledSlotSize = hotbarSlotSize * hotbarSlotScale;
        const totalWidth = hotbarSlotCount * scaledSlotSize
            + (hotbarSlotCount - 1) * hotbarSlotGap;
        const startX = this.config.scene.scale.width / 2
            - totalWidth / 2
            + scaledSlotSize / 2;
        const hotbarY = this.config.scene.scale.height - 44;

        this.waterText.setPosition(
            startX + slotIndex * (scaledSlotSize + hotbarSlotGap),
            hotbarY - scaledSlotSize / 2 - waterTextHotbarMargin
        );
    }

    private getWateringCanHotbarSlot(): number | null {
        const slotIndex = this.config.inventory.slots
            .slice(0, hotbarSlotCount)
            .findIndex((slot) => slot.itemId === 'wateringCan');

        return slotIndex === -1 ? null : slotIndex;
    }

    private getCurrentWellZone(): Geom.Rectangle | undefined {
        const body = this.config.player.sprite.body as Phaser.Physics.Arcade.Body;
        const playerBounds = new Geom.Rectangle(
            body.x,
            body.y,
            body.width,
            body.height
        );

        return this.wellZones.find((zone) =>
            Geom.Intersects.RectangleToRectangle(zone, playerBounds)
        );
    }
}
