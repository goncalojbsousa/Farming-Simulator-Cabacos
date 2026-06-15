import { GameObjects, Geom, Scene } from 'phaser';
import { playSound } from '../services/SoundService';
import { createPixelNineSlice } from './PixelNineSlice';

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
    const buttonHeight = Math.min(height, 39);
    const fontSize = Math.min(22, Math.max(13, Math.floor(buttonHeight * 0.5)));
    const background = createPixelNineSlice(
        scene,
        'button',
        width,
        buttonHeight,
        3,
        2,
        'trimmed'
    );

    if (isSelected) {
        background.setTint(0xffd06a);
    }

    const text = scene.add.text(0, -2, label, {
        fontFamily: 'Arial Black',
        fontSize,
        color: '#fff4d7',
        stroke: '#1a100b',
        strokeThickness: Math.max(2, Math.floor(fontSize / 7)),
        align: 'center'
    }).setOrigin(0.5).setResolution(2);

    const button = scene.add.container(x, y, [background, text])
        .setSize(width, buttonHeight)
        .setInteractive(
            new Geom.Rectangle(-width / 2, -buttonHeight / 2, width, buttonHeight),
            Geom.Rectangle.Contains
        );

    button.on('pointerover', () => {
        if (!isSelected) {
            background.setTint(0xffd09a);
        }
    });

    button.on('pointerout', () => {
        if (!isSelected) {
            background.clearTint();
        }
    });

    button.on('pointerdown', () => {
        if (playClickSound) {
            playSound(scene, 'select');
        }

        onClick();
    });

    return button;
}
