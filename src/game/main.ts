import { Boot } from './scenes/Boot';
import { CropMarket } from './scenes/CropMarket';
import { GameOver } from './scenes/GameOver';
import { Game as MainGame } from './scenes/Game';
import { HouseInterior } from './scenes/HouseInterior';
import { MainMenu } from './scenes/MainMenu';
import { SeedShop } from './scenes/SeedShop';
import { TownHall } from './scenes/TownHall';
import { AUTO, Game, Scale } from 'phaser';
import { Preloader } from './scenes/Preloader';
import { SettingsMenu } from './scenes/SettingsMenu';

//  Find out more information about the Game Config at:
//  https://docs.phaser.io/api-documentation/typedef/types-core#gameconfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#028af8',
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 },
            debug: false
        }
    },
    scale: {
        mode: Scale.RESIZE,
        autoCenter: Scale.CENTER_BOTH
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        SettingsMenu,
        MainGame,
        HouseInterior,
        CropMarket,
        SeedShop,
        TownHall,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
