import { GameObjects, Scene } from 'phaser';

type ButtonColors = {
    normal: number;
    hover: number;
    selected?: number;
};

const defaultButtonColors: ButtonColors = {
    normal: 0x2f5d2c,
    hover: 0x3f7a39,
    selected: 0xd6a84f
};

export function createTextButton(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    isSelected = false
): GameObjects.Container {
    const colors = defaultButtonColors;
    const fillColor = isSelected && colors.selected ? colors.selected : colors.normal;

    const background = scene.add.rectangle(0, 0, width, height, fillColor)
        .setStrokeStyle(2, 0xffffff)
        .setInteractive({ useHandCursor: true });

    const text = scene.add.text(0, 0, label, {
        fontFamily: 'Arial',
        fontSize: 24,
        color: '#ffffff',
        align: 'center'
    }).setOrigin(0.5);

    const button = scene.add.container(x, y, [background, text]);

    // Keep the hover state on the rectangle so the text remains stable.
    background.on('pointerover', () => {
        background.setFillStyle(colors.hover);
    });

    background.on('pointerout', () => {
        background.setFillStyle(fillColor);
    });

    background.on('pointerdown', onClick);

    return button;
}
