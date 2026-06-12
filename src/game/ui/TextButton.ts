import { GameObjects, Scene } from 'phaser';
import { playSound } from '../services/SoundService';

type ButtonColors = {
    normal: number;
    hover: number;
    selected: number;
};

const defaultButtonColors: ButtonColors = {
    normal: 0x8a5a31,
    hover: 0xb47a3f,
    selected: 0xd39a3c
};

export function createTextButton(
    scene: Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    label: string,
    onClick: () => void,
    isSelected = false,
    playClickSound = true
): GameObjects.Container {
    const colors = defaultButtonColors;
    const fillColor = isSelected ? colors.selected : colors.normal;
    const fontSize = Math.min(24, Math.max(13, Math.floor(height * 0.42)));

    const shadow = scene.add.rectangle(4, 5, width, height, 0x1a100b, 0.35);
    const border = scene.add.rectangle(0, 0, width, height, 0x5a3822)
        .setStrokeStyle(3, 0x332015);
    const background = scene.add.rectangle(0, -2, width - 8, height - 8, fillColor)
        .setStrokeStyle(2, 0xe3a35a)
        .setInteractive({ useHandCursor: true });
    const highlight = scene.add.rectangle(
        0,
        -height / 2 + 7,
        width - 18,
        3,
        0xffe3a3,
        0.7
    );

    const text = scene.add.text(0, -2, label, {
        fontFamily: 'Arial Black',
        fontSize,
        color: '#fff4d7',
        stroke: '#1a100b',
        strokeThickness: Math.max(2, Math.floor(fontSize / 7)),
        align: 'center'
    }).setOrigin(0.5).setResolution(2);

    const button = scene.add.container(x, y, [
        shadow,
        border,
        background,
        highlight,
        text
    ]);

    background.on('pointerover', () => {
        if (!isSelected) {
            background.setFillStyle(colors.hover);
        }
    });

    background.on('pointerout', () => {
        background.setFillStyle(fillColor);
    });

    background.on('pointerdown', () => {
        if (playClickSound) {
            playSound(scene, 'select');
        }

        onClick();
    });

    return button;
}
