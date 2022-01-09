console.log("Tes")

import Phaser from 'phaser'

import CoronaBusterScene from './scenes/CoronaBusterScene'
import GameOverScene from './scenes/GameOverScene'

const config = {
	type: Phaser.AUTO,
	width: 400,
	height: 620,
	physics: {
		default: 'arcade',
	},
	scene: [CoronaBusterScene, GameOverScene],
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH
	},
}

export default new Phaser.Game(config)
