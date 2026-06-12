import { Scene } from 'phaser';

export type SoundKey =
    | 'buyLand'
    | 'doorOpen'
    | 'fail'
    | 'faint'
    | 'getWater'
    | 'grassyStep'
    | 'hoe'
    | 'openMenu'
    | 'plantSeed'
    | 'purchaseClick'
    | 'select'
    | 'sickle'
    | 'sleep'
    | 'toolSwap'
    | 'waterPlants';

export function playSound(
    scene: Scene,
    key: SoundKey,
    volume = 0.5,
    rate = 1
): void {
    scene.sound.play(key, { volume, rate });
}
