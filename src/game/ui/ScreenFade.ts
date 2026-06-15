import { GameObjects, Scene } from 'phaser';

export class ScreenFade {
    private blackOverlay: GameObjects.Rectangle;

    constructor(private scene: Scene) {
        this.blackOverlay = scene.add.rectangle(0, 0, 1, 1, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(2000)
            .setAlpha(0);

        this.layout();
    }

    play(onFadeInComplete: () => void, onFadeOutComplete?: () => void): void {
        this.fadeIn(() => {
            onFadeInComplete();
            this.fadeOut(onFadeOutComplete);
        });
    }

    fadeIn(onComplete: () => void): void {
        this.scene.tweens.add({
            targets: this.blackOverlay,
            alpha: 1,
            duration: 700,
            onComplete
        });
    }

    fadeOut(onComplete?: () => void): void {
        this.scene.tweens.add({
            targets: this.blackOverlay,
            alpha: 0,
            duration: 700,
            delay: 300,
            onComplete
        });
    }

    showBlack(): void {
        this.blackOverlay.setAlpha(1);
    }

    layout(): void {
        this.blackOverlay.setSize(this.scene.scale.width, this.scene.scale.height);
    }

    getGameObject(): GameObjects.GameObject {
        return this.blackOverlay;
    }
}
