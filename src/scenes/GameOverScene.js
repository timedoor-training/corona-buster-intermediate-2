import Phaser from 'phaser'

var replayButton

export default class CoronaBusterScene extends
    Phaser.Scene {
    constructor() {
        super('game-over-scene')
    }
    init(data) {
        this.score = data.score
    }
    preload() {
        this.load.image('gameover', 'images/gameover.png')
        this.load.image('replay', 'images/replay.png')
    }
    create() {
        this.add.image(200, 320, 'background')
        this.add.image(200, 320, 'gameover')


        //replay button
        replayButton = this.add.image(200, 500, "replay").setInteractive().setScale(0.5, 0.5)
        replayButton.once('pointerup', () => {
            this.scene.start('corona-buster-scene')
        }, this)

        this.add.text(80, 100, 'SCORE:', {
            fontSize:
                '30px', fill: '#000'
        })
        //menambahkan nilai score
        this.add.text(300, 100, this.score, {
            fontSize:
                '30px', fill: '#000'
        })

    }

}
