/**
 * Created by Neo on 2016/6/23.
 */

$('#rule').click(function () {
    HANDLE.openRulePage();
});
$('#startBtn').click(function () {
    HANDLE.openGame();
    game.state.start('play');
});
$('#rulePage').find(".closeBtn").click(function () {
    HANDLE.closeRulePage();
});
$('.again').click(function () {
    var _this = $(this);
    HANDLE.playAgain(_this);
});
$('#callback').find(".closeBtn").click(function () {
    HANDLE.closeCallback();
});
// 领取奖品方法
// 全局score
$('#get').click(function () {
    $('#success').hide();
    $('#callback').show();
    $.ajax({
        url: '../briberyMobile/receiveReward',
        type: "POST",
        data: {activityId: activityId, promoterId: promoterId,playScore:score},
        success: function (result) {
            if (result.success) {
                window.location.href = result.data;
            } else {
                $('#callback').find('img').hide();
                $('#callback').find('p').show();
                $('#callback').find('p').text(result.msg);
            }
        }, error: function () {
            $('#callback').find('img').hide();
            $('#callback').find('p').show();
            $('#callback').find('p').text('服务君繁忙，请稍后再试~');
        }
    })
});
window.onresize = function(){
    PAGE.init();
};
window.onload = function () {
    PAGE.init();
    game.state.start('boot');
    baseline = 500;
};
/**
 * 界面操作方法
 * @type {{openRulePage: HANDLE.openRulePage, closeRulePage: HANDLE.closeRulePage, openGame: HANDLE.openGame}}
 */
var HANDLE = {
    openRulePage: function () {
        $('#popup').show();
        $('#rulePage').show();
    },
    closeRulePage: function () {
        $('#rulePage').hide();
        $('#popup').hide();
    },
    openGame: function () {
        $('#popup').show();
        $('#game').show();
    },
    openSuccess: function (s) {
        $('#result').show();
        $('#success').find('.scores').text(s);
        $('#success').show();
    },
    openFailure: function (s) {
        $('#result').show();
        $('#failure').find('.scores').text(s);
        $('#failure').show();
    },
    closeCallback: function () {
        $('#success').show();
        $('#callback').hide();
    },
    playAgain: function (t) {
        var id = t.parent().parent().attr('id');
        $('#' + id).hide();
        $('#result').hide();
        $('#popup').hide();
    }
};
/**
 * 页面初始化配置
 * @type {{auto: PAGE.auto, resizeCanvas: PAGE.resizeCanvas, init: PAGE.init}}
 * @function auto: 动态改变根字号
 * @function resizeCanvas: 动态改变canvas大小
 * @function init: 初始化
 */
var PAGE = {
    auto: function () {
        var width = $('body').width();
        var fontSize = width/ 30+ 'px';
        $('html').css('fontSize', fontSize + '!important');
    },
    init: function () {
        PAGE.auto();
    }
};
/**
 * baseline 最低分基线，页面加载初始化
 * totalSecond 游戏时间
 * score 游戏分数
 * timeOver [Boolean] 默认 false]
 * countDownTime [function] 定时器函数
 * imgSrc 图片资源root路径
 * packetLength 红包图片数量 / 长度
 * packetSprite，smokeSprite 图片资源
 * states 场景对象
 * Width，Height 页面宽高
 * game 游戏主构造函数
 */
var baseline, totalSecond , score, timeOver, countDownTime;
var imgSrc = 'resource/images/';
var packetLength = 9;
var packetSprite = 'sprite.png';
var smokeSprite = 'smoke.png';
var timeOverImage = 'over.png';
var states = {};
var Width = $(window).width();
var Height = $(window).height();
var game = new Phaser.Game(Width, Height, Phaser.AUTO, 'game', null, true);

states.boot = function() {
    this.init = function () {
        if ( !game.device ) {
            game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
        }
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.refresh();
    };
    this.create = function () {
        game.state.start('preload');
    };
};
states.preload = function () {
    this.preload = function () {
        game.load.spritesheet('sprites', imgSrc + packetSprite, 80, 80);
        game.load.spritesheet('smoke', imgSrc + smokeSprite, 80, 80);
        game.load.image('over', imgSrc + timeOverImage);
        game.load.onFileComplete.add(function(progress){
            if ( progress === 100 ) $('#loading').hide();
        });
    };
};
states.play  = function () {
    this.init = function () {
        totalSecond = 30;
        score = 0;
        timeOver = false;
        this.paint();
        this.countDown();
        game.time.events.loop(250, this.paint, this);
        game.time.events.start();
    };
    this.paint = function () {
        var xy = this.randomXY();
        var i = parseInt(Math.random()*packetLength);
        var packet = game.add.image(xy.x, xy.y, 'sprites', i);
        setTimeout(function () {
            packet.kill();
        }, 500);
        packet.inputEnabled = true;
        packet.events.onInputDown.add(function () {
            score += 10;
            packet.kill();
            this.smoke(xy.x,xy.y);
        },this);

    };
    this.smoke = function (x, y) {
        var smoke = game.add.sprite(x, y, 'smoke');
        smoke.animations.add('bong',[0,1,2,3,4]);
        smoke.animations.play('bong', 18, false, true);
    };
    this.randomXY = function () {
        var Coords = {};
        var min = 100;
        var paintWidth = Width - 80;
        var paintHeight = Height - 80;
        Coords.x = parseInt(Math.random()*paintWidth+1);
        Coords.y = parseInt(Math.random()*(paintHeight-min+1)+min);
        return Coords;
    };
    this.create = function () {
        this.timeText = game.add.text( Width/2 ,20,'时间',{
            font: "normal 22px 微软雅黑",
            fill: "#fff"
        });
        this.timeText.anchor.setTo(0.5,0.5);
        this.second = game.add.text( Width/2 ,60, totalSecond,{
            font: "normal 30px 微软雅黑",
            fill: "#fff"
        });
        this.second.anchor.setTo(0.5,0.5);
        this.scoreText = game.add.text(20,30,'分数：' + score,{
            font: "normal 22px 微软雅黑",
            fill: "#fef000"
        });
    };
    this.updateScore = function () {
        this.scoreText.text = '分数：' + score;
    };
    this.countDown = function () {
        countDownTime = setInterval(function () {
            totalSecond = parseFloat( (totalSecond*100 - 9) / 100 ).toFixed(2);
        },90);
    };
    this.updateSecond = function () {
        if ( totalSecond > 0 ) {
            this.second.text = totalSecond;
        } else{
            this.second.text = '0.00';
            this.gameOver();
            game.time.events.stop();
            clearInterval(countDownTime);
        }
    };
    this.gameOver = function () {
        timeOver = true;
    };
    this.result = function () {
        if ( timeOver ) {
            if ( score >= baseline ) {
                game.state.start('success');
            } else {
                game.state.start('failure');
            }
        }
    };
    this.update = function () {
        this.updateScore();
        this.updateSecond();
        this.result();

    };
};
states.success = function () {
    this.create = function () {
        var over = game.add.image(Width/2, Height/2, 'over');
        over.anchor.set(0.5, 0.5);
        over.scale.set(0.8);
        over.angle = 0;
        game.add.tween(over.scale).to( { x: 1, y: 1 }, 200, 'Linear', true, 0, 6, true);
        game.add.tween(over).to({ angle: -10 },100,'Linear',true, 0, 12, true);
        setTimeout(function () {
            HANDLE.openSuccess(score);
        }, 1300);
    };
};
states.failure = function () {
    this.create = function () {
        var over = game.add.image(Width/2, Height/2, 'over');
        over.anchor.set(0.5, 0.5);
        over.scale.set(0.8);
        over.angle = 0;
        game.add.tween(over.scale).to( { x: 1, y: 1 }, 200, 'Linear', true, 0, 6, true);
        game.add.tween(over).to({ angle: -10 },100,'Linear',true, 0, 12, true);
        setTimeout(function () {
            HANDLE.openFailure(score);
        }, 1300);
    };
};

game.state.add('boot', states.boot);
game.state.add('preload', states.preload);
game.state.add('play', states.play);
game.state.add('success', states.success);
game.state.add('failure', states.failure);