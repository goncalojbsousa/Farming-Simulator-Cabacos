import { GameObjects, Scene } from 'phaser';
import { translate } from '../services/LanguageService';
import { QuestService, QuestView } from '../services/QuestService';
import { createPixelNineSlice } from './PixelNineSlice';

const frameWidth = 270;
const frameHeight = 96;
const marginRight = 24;
const cardY = 94;

export class QuestDisplay {
    private container: GameObjects.Container;
    private icon: GameObjects.Image;
    private statusText: GameObjects.Text;
    private titleText: GameObjects.Text;
    private progressText: GameObjects.Text;
    private rewardText: GameObjects.Text;

    constructor(private scene: Scene, private quests: QuestService) {
        const panel = createPixelNineSlice(scene, 'menuBrownDarker', frameWidth, frameHeight);
        this.icon = scene.add.image(-104, -11, 'pumpkin', 5)
            .setDisplaySize(28, 30);

        this.statusText = scene.add.text(-74, -30, '', {
            fontFamily: 'Arial Black',
            fontSize: 11,
            color: '#ffe7a3',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);

        this.titleText = scene.add.text(-74, -11, '', {
            fontFamily: 'Arial Black',
            fontSize: 14,
            color: '#fff8df',
            stroke: '#1a100b',
            strokeThickness: 3,
            wordWrap: { width: 174 }
        }).setOrigin(0, 0.5).setResolution(2);

        this.progressText = scene.add.text(-74, 14, '', {
            fontFamily: 'Arial Black',
            fontSize: 12,
            color: '#fff4d7',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0, 0.5).setResolution(2);

        const coin = scene.add.image(-42, 34, 'coin').setScale(1.2);
        this.rewardText = scene.add.text(28, 34, '', {
            fontFamily: 'Arial Black',
            fontSize: 11,
            color: '#ffe7a3',
            stroke: '#1a100b',
            strokeThickness: 3
        }).setOrigin(0.5).setResolution(2);

        this.container = scene.add.container(0, cardY, [
            panel,
            this.icon,
            this.statusText,
            this.titleText,
            this.progressText,
            coin,
            this.rewardText
        ])
            .setScrollFactor(0)
            .setDepth(960);

        this.layout();
        this.refresh();
    }

    refresh(): void {
        const quest = this.getQuestToDisplay();

        this.container.setVisible(!!quest);

        if (!quest) {
            return;
        }

        this.icon
            .setTexture(quest.iconTextureKey, quest.iconFrame)
            .setDisplaySize(28, 30);
        this.statusText.setText(
            quest.isReadyToClaim ? translate('questReady') : translate('questActive')
        );
        this.titleText.setText(translate(quest.titleKey));
        this.progressText.setText(
            `${translate('questProgress')}: ${quest.progress}/${quest.targetAmount}`
        );
        this.rewardText.setText(`${translate('reward')}: ${quest.reward} $`);
    }

    layout(): void {
        const x = Math.max(
            frameWidth / 2 + 12,
            this.scene.scale.width - frameWidth / 2 - marginRight
        );

        this.container.setPosition(x, cardY);
    }

    getUiObjects(): GameObjects.GameObject[] {
        return [this.container];
    }

    private getQuestToDisplay(): QuestView | undefined {
        const activeQuests = this.quests.getActiveQuests();

        return activeQuests.find((quest) => quest.isReadyToClaim)
            ?? activeQuests[0];
    }
}
