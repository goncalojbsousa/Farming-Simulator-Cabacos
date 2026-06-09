import { GameInput } from '../input/GameInput';
import { Player } from '../objects/Player';
import { InventoryService } from '../services/InventoryService';
import { MoneyService } from '../services/MoneyService';
import { SeedShopPanel } from '../ui/SeedShopPanel';

export class SeedShopSystem {
    private panel: SeedShopPanel;
    private prompt: Phaser.GameObjects.Text;
    private shopZone: Phaser.Geom.Rectangle;

    constructor(
        private scene: Phaser.Scene,
        map: Phaser.Tilemaps.Tilemap,
        private player: Player,
        inventory: InventoryService,
        money: MoneyService,
        onPurchase: () => void
    ) {
        this.panel = new SeedShopPanel(scene, inventory, money, onPurchase);
        this.prompt = scene.add.text(0, 0, 'E - Comprar sementes', {
            fontFamily: 'Arial Black',
            fontSize: 16,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setScrollFactor(0).setDepth(960).setVisible(false);

        const shop = map.getObjectLayer('Interactions')!.objects[0];
        this.shopZone = new Phaser.Geom.Rectangle(
            shop.x,
            shop.y,
            shop.width!,
            shop.height!
        );

        this.layout();
    }

    update(input: GameInput): void {
        const playerIsInShop = this.playerIsInShop();

        if (input.shopPressed() && playerIsInShop) {
            this.panel.toggle();
        }

        this.prompt.setVisible(playerIsInShop && !this.panel.isOpen());

        if (!playerIsInShop) {
            this.panel.close();
        }
    }

    isOpen(): boolean {
        return this.panel.isOpen();
    }

    containsScreenPoint(x: number, y: number): boolean {
        return this.panel.containsScreenPoint(x, y);
    }

    layout(): void {
        this.panel.layout();
        this.prompt.setPosition(
            this.scene.scale.width / 2,
            this.scene.scale.height - 104
        );
    }

    getUiObjects(): Phaser.GameObjects.GameObject[] {
        return [...this.panel.getUiObjects(), this.prompt];
    }

    private playerIsInShop(): boolean {
        const playerBody = this.player.sprite.body as Phaser.Physics.Arcade.Body;
        return this.shopZone.contains(playerBody.center.x, playerBody.center.y);
    }
}
