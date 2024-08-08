import {Character, Sentence, Word} from "../game/elements/text";
import {Scene} from "../game/elements/scene";
import {Story} from "../game/elements/story";
import {Menu} from "../game/elements/menu";
import {Script, ScriptCtx} from "../game/elements/script";
import {LiveGame} from "../game/game";
import {Condition, Lambda} from "../game/elements/condition";
import {Image} from "../game/elements/image";
import {Transform, TransformNameSpace} from "@lib/game/game/elements/transform";
import {GameState} from "@lib/ui/components/player/gameState";

import mainMenuBackground from "@/public/static/images/main-menu-background.webp";
import {Sound} from "@lib/game/game/elements/sound";
import ImageTransformProps = TransformNameSpace.ImageTransformProps;

const scene1 = new Scene("scene1", {
    background: mainMenuBackground,
    invertY: true,
    invertX: false
})

const i1 = new Image("i1", {
    src: "/static/images/sensei.png",
    position: {
        xalign: 0.3,
        yalign: 0.5
    },
    scale: 0.7
});

const story = new Story("test");
const c1 = new Character("还没有名字");
const c2 = new Character("我");
const sound1 = new Sound({
    src: "/static/sounds/SE_Write_01.wav",
    sync: false
})


const createConditionIsNumberCorrect = (n: number) => new Condition()
    .If(new Lambda(({gameState, resolve}) => {
            resolve(isNumberCorrect(gameState, n));
            return () => cleanAfterChooseNumber(gameState);
        }),
        c2Say_You_Are_Correct()
    ).Else(
        c2.say("很遗憾，你猜错了")
            .toActions()
    )
    .toActions();


const scene1Actions = scene1.action([
    i1.show({
        ease: "circOut",
        duration: 0.5,
    }).toActions(),
    new Character(null)
        .say("简体中文，繁體中文, 日本語, 한국어, ไทย, Tiếng Việt, हिन्दी, বাংলা, తెలుగు, मराठी, 1234567890!@#$%^&*()QWERTYUIOPASDFGHJKLZCVN{}|:\"<>?~`, A quick brown fox jumps over the lazy dog.")
        .toActions(),
    i1.applyTransform(new Transform<ImageTransformProps>({
        position: {
            yoffset: 20,
        },
    }, {
        duration: 0.2
    }))
        .applyTransform(new Transform<ImageTransformProps>({
            position: {
                yoffset: 0,
            },
            opacity: 1
        }, {
            duration: 0.2
        }))
        .toActions(),
    sound1.play().toActions(),
    c1
        .say("你好！")
        .say("你最近过的怎么样？")
        .toActions(),
    new Menu("我最近过的怎么样？")
        .choose({
            action:
                c2.say("是吗？")
                    .say("那真的是太棒了")
                    .toActions()
            ,
            prompt: "我过的很好"
        })
        .choose({
            action:
                c2.say("我也一样")
                    .say("过的还不错")
                    .toActions()
            ,
            prompt: "还不错吧"
        })
        .toActions(),
    i1.applyTransform(new Transform<ImageTransformProps>({
        position: {
            xalign: 0.75,
            yalign: 0.5
        },
    }, {
        duration: 1,
        ease: "linear"
    }))
        .applyTransform(new Transform<ImageTransformProps>({
            scale: 1.0,
            opacity: 0.5
        }, {
            duration: 1,
            ease: "easeInOut"
        }))
        .applyTransform(new Transform<ImageTransformProps>({
            position: {
                yoffset: 100,
                xalign: 0.45,
                yalign: 0.3
            }
        }, {
            duration: 1,
            ease: "easeInOut"
        }))
        .toActions(),
    // scene1.setSceneBackground({
    //     backgroundOpacity: 0,
    // }, {
    //     duration: 1,
    //     ease: "linear"
    // }).setSceneBackground({
    //     background: mainMenuBackground2
    // }, {duration: 0}).setSceneBackground({
    //     backgroundOpacity: 1,
    // }, {
    //     duration: 1,
    //     ease: "linear"
    // }).toActions(),
    i1.hide().toActions(),
    c2
        .say("那你愿不愿意陪我玩一个游戏？")
        .say("听好游戏规则")
        .say([new Word("我会思考一个介于 "), new Word("1 和 10", {color: "#f00"}), "之间的数字"])
        .say("你要猜这个数字是多少")
        .toActions(),
    new Script((ctx: ScriptCtx) => {
        const namespace =
            ctx.gameState.clientGame.game
                .getLiveGame()
                .storable
                .getNamespace(LiveGame.GameSpacesKey.game)
        let availableNumbers = [3, 6, 8];
        const number = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        namespace.set("number", number);
        console.log("number", number);
        return () => namespace.set("number", void 0);
    }).toActions(),
    new Menu(new Sentence(c2, "那么，你猜这个数字是多少？"))
        .choose({
            action: createConditionIsNumberCorrect(3),
            prompt: "3"
        })
        .choose({
            action: createConditionIsNumberCorrect(6),
            prompt: "6"
        })
        .choose({
            action: createConditionIsNumberCorrect(8),
            prompt: "8"
        })
        .toActions(),
    c2.say("游戏结束！")
        .toActions()
]);

function isNumberCorrect(gameState: GameState, number: number) {
    const namespace =
        gameState.clientGame.game
            .getLiveGame()
            .storable
            .getNamespace(LiveGame.GameSpacesKey.game)
    return namespace.get("number") === number;
}

function cleanAfterChooseNumber(gameState: GameState) {
    const namespace =
        gameState.clientGame.game
            .getLiveGame()
            .storable
            .getNamespace(LiveGame.GameSpacesKey.game)
    namespace.set("number", void 0);
}

function c2Say_You_Are_Correct() {
    return c2.say("恭喜你！")
        .say("你猜对了！")
        .toActions();
}

story.action([
    scene1Actions
]);

export {
    story
}


