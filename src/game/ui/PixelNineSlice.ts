import { GameObjects, Scene } from 'phaser';

export function createPixelNineSlice(
    scene: Scene,
    texture: string,
    width: number,
    height: number,
    pixelScale = 3,
    sliceSize = 3,
    frame?: string | number
): GameObjects.NineSlice {
    return scene.add.nineslice(
        0,
        0,
        texture,
        frame,
        width / pixelScale,
        height / pixelScale,
        sliceSize,
        sliceSize,
        sliceSize,
        sliceSize
    ).setScale(pixelScale);
}
