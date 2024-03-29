import Phaser from 'phaser'

import FallingObject from '../ui/FallingObject'
import Laser from '../ui/Laser'

import ScoreLabel from '../ui/ScoreLabel.js'
import LifeLabel from '../ui/LifeLabel.js'

export default class CoronaBusterScene extends
    Phaser.Scene {
    constructor() {
        super('corona-buster-scene')
    }
    init() {
        this.clouds = undefined

        //add Button
        this.nav_left = false
        this.nav_right = false
        this.shoot = false


        //Add Player
        this.player = undefined

        this.speed = 100
        this.cursors = undefined

        //Falling Enemies
        this.enemies = undefined
        this.enemySpeed = 200

        //Laser
        this.lasers = undefined
        this.lastFired = 0

        this.scoreLabel = undefined
        this.lifeLabel = undefined

        this.handsanitizer = undefined

        this.backsound = undefined
    }
    preload() {
        this.load.image('background', 'images/bg_layer1.png')
        this.load.image('cloud', 'images/cloud.png')
        this.load.image('left-btn', 'images/left-btn.png')
        this.load.image('right-btn', 'images/right-btn.png')
        this.load.image('shoot-btn', 'images/shoot-btn.png')
        //upload sound
        this.load.audio('jumpSound', 'sfx/phaseJump1.ogg')

        this.load.spritesheet('player', 'images/ship.png',
            { frameWidth: 66, frameHeight: 66 })

        // Load enemy
        this.load.image('enemy', 'images/enemy.png')

        this.load.spritesheet('laser', 'images/laser-bolts.png',
            {
                frameWidth: 16, frameHeight: 32,
                startFrame: 16, endFrame: 32
            }
        )
        this.load.image('gameover', 'images/gameover.png')
        this.load.image('replay', 'images/replay.png')
        this.load.image('handsanitizer', 'images/handsanitizer.png')

        this.load.audio('laserSound', 'sfx/sfx_laser.ogg')
        this.load.audio('destroySound', 'sfx/destroy.mp3')
        this.load.audio('handsanitizerSound', 'sfx/handsanitizer.mp3')

        this.load.audio('backsound', 'sfx/backsound/SkyFire.ogg')

        this.load.audio('gameOverSound', 'sfx/gameover.ogg')
    }
    create() {
        //Add background
        const gameWidth = this.scale.width * 0.5
        const gameHeight = this.scale.height * 0.5
        this.add.image(gameWidth, gameHeight, 'background')

        //add cloud
        this.clouds = this.physics.add.group({
            key: 'cloud',
            repeat: 20
        })
        Phaser.Actions.RandomRectangle(this.clouds.getChildren(), this.physics.world.bounds)

        this.createButton()
        this.player = this.createPlayer()
        this.cursors = this.input.keyboard.createCursorKeys()

        // Create Enemy
        this.enemies = this.physics.add.group({
            classType: FallingObject,
            //banyaknya enemy dalam satu kali grup
            maxSize: 100,
            runChildUpdate: true
        })
        this.time.addEvent({
            delay: Phaser.Math.Between(2000, 5000),
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        })

        //create laser
        this.lasers = this.physics.add.group({
            classType: Laser,
            maxSize: 10,
            runChildUpdate: true
        })

        //overlap
        this.physics.add.overlap(
            this.lasers,
            this.enemies,
            this.hitEnemy,
            undefined,
            this
        )

        this.scoreLabel = this.createScoreLabel(16, 16, 0)
        this.lifeLabel = this.createLifeLabel(16, 43, 3)


        this.physics.add.overlap(this.player,
            this.enemies, this.decreaseLife, null, this)

        this.handsanitizer = this.physics.add.group({
            classType: FallingObject,
            runChildUpdate: true
        })

        this.time.addEvent({
            delay: 10000,
            callback: this.spawnHandsanitizer,
            callbackScope: this,
            loop: true
        })

        this.physics.add.overlap(this.player,
            this.handsanitizer, this.increaseLife, null, this)


        this.backsound = this.sound.add('backsound')
        var soundConfig = {
            loop: true
        }
        this.backsound.play(soundConfig)
    }
    update(time) {
        this.clouds.children.iterate((child) => {
            //arah gerak awan ke bawah
            child.setVelocityY(100)
            if (child.y > this.scale.height) {
                child.x = Phaser.Math.Between(10, 400)
                child.y = child.displayHeight * -1
            }
        })
        this.movePlayer(this.player, time)
    }
    createButton() {
        this.input.addPointer(3)
        let shoot = this.add.image(320, 550, 'shoot-btn')
            .setInteractive().setDepth(0.5).setAlpha(0.8)
        let nav_left = this.add.image(50, 550, 'left-btn')
            .setInteractive().setDepth(0.5).setAlpha(0.8)
        let nav_right = this.add.image(nav_left.x + nav_left
            .displayWidth + 20, 550, 'right-btn')
            .setInteractive().setDepth(0.5).setAlpha(0.8)

        nav_left.on('pointerdown', () => {
            this.nav_left = true
        }, this)
        nav_left.on('pointerout', () => {
            this.nav_left =
                false
        }, this)
        nav_right.on('pointerdown', () => {
            this.nav_right =
                true
        }, this)
        nav_right.on('pointerout', () => {
            this.nav_right =
                false
        }, this)
        shoot.on('pointerdown', () => { this.shoot = true },
            this)
        shoot.on('pointerout', () => { this.shoot = false },
            this)
    }
    movePlayer(player, time) {
        if (this.cursors.left.isDown || this.nav_left) {
            player.setVelocityX(this.speed * -1)
            player.anims.play('left', true)
            player.setFlipX(false)
            // this.sound.play('jumpSound')
        } else if (this.cursors.right.isDown || this.nav_right) {
            player.setVelocityX(this.speed)
            player.anims.play('right', true)
            player.setFlipX(true)
            // this.sound.play('jumpSound')
        } else {
            player.setVelocityX(0)
            player.anims.play('turn')
        }

        if ((this.shoot || this.cursors.space.isDown) && time > this.lastFired) {
            const laser = this.lasers.get(0, 0, 'laser')
            if (laser) {
                laser.fire(this.player.x, this.player.y)
                this.lastFired = time + 500
                this.sound.play('laserSound')
            }
        }
    }

    createPlayer() {
        const player = this.physics.add.sprite(200, 450,
            'player')
        player.setCollideWorldBounds(true)
        this.anims.create({
            key: 'turn',
            frames: [{ key: 'player', frame: 0 }],
        })
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers(
                'player', { start: 1, end: 2 }),
            frameRate: 10
        })
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player',
                { start: 1, end: 2 }),
            frameRate: 10
        })

        return player
    }

    spawnEnemy() {
        const config = {
            speed: this.enemySpeed,
            rotation: 0.06
        }
        const enemy = this.enemies.get(0, 0, 'enemy', config)
        const enemyWidth = enemy.displayWidth
        const positionX = Phaser.Math.Between(enemyWidth,
            this.scale.width - enemyWidth)
        if (enemy) {
            enemy.spawn(positionX)
        }
    }

    hitEnemy(laser, enemy) {
        laser.erase()
        enemy.die()
        this.sound.play('destroySound')

        this.scoreLabel.add(10)
        if (this.scoreLabel.getScore() % 100 == 0) {
            this.enemySpeed += 30
        }
    }

    createScoreLabel(x, y, score) {
        const style = { fontSize: '32px', fill: '#000' }
        const label = new ScoreLabel(this, x, y,
            score, style).setDepth(1)
        this.add.existing(label)
        return label
    }

    createLifeLabel(x, y, life) {
        const style = { fontSize: '32px', fill: '#000' }
        const label = new LifeLabel(this, x, y,
            life, style).setDepth(1)
        this.add.existing(label)
        return label
    }

    decreaseLife(player, enemy) {
        enemy.die()
        this.lifeLabel.substract(1)
        if (this.lifeLabel.getLife() == 2) {
            player.setTint(0xff0000)
        } else if (this.lifeLabel.getLife() == 1) {
            player.setTint(0xff0000).setAlpha(0.2)
        } else if (this.lifeLabel.getLife() == 0) {
            this.scene.start('game-over-scene',
                { score: this.scoreLabel.getScore() })
            this.sound.stopAll()
            this.sound.play('gameOverSound')
        }
    }

    spawnHandsanitizer() {
        const config = {
            speed: 60,
            rotation: 0
        }
        const handsanitizer = this.handsanitizer.get(0, 0, 'handsanitizer', config)
        const handsanitizerWidth = handsanitizer.displayWidth
        const positionX = Phaser.Math.Between(handsanitizerWidth,
            this.scale.width - handsanitizerWidth)
        if (handsanitizer) {
            handsanitizer.spawn(positionX)
        }
    }

    increaseLife(player, handsanitizer) {
        handsanitizer.die()
        this.sound.play('destroySound')
        this.lifeLabel.add(1)
        if (this.lifeLabel.getLife() >= 3) {
            player.clearTint().setAlpha(2)
        }
    }

}
