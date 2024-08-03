import { Character, Sentence, Word } from "../game/elements/text";
import { Scene } from "../game/elements/scene";
import { Story } from "../game/elements/story";
import { Menu } from "../game/elements/menu";
import { Script, ScriptCtx } from "../game/elements/script";
import { LiveGame } from "../game/game";
import { Condition, Lambda } from "../game/elements/condition";
import { GameState } from "@/lib/ui/components/player/player";
import { Image } from "../game/elements/image";
import {Transform, TransformNameSpace} from "@lib/game/game/elements/transform";
import SceneBackgroundTransformProps = TransformNameSpace.SceneBackgroundTransformProps;


const story = new Story("test");
const c1 = new Character("还没有名字");
const c2 = new Character("我");
const i1 = new Image("i1", {
    src: "/static/images/sensei.png",
    position: "left",
    scale: 0.7
});

const createConditionIsNumberCorrect = (n: number) => new Condition()
    .If(new Lambda(({ gameState, resolve }) => {
        resolve(isNumberCorrect(gameState, n));
        return () => cleanAfterChooseNumber(gameState);
    }),
        c2Say_You_Are_Correct()
    ).Else(
        c2.say("很遗憾，你猜错了")
            .toActions()
    )
    .toActions();

const scene1 = new Scene("scene1", {
    background: "#419eff"
})
const scene1Actions = scene1.action([
    i1.show({
        ease: "circOut",
        duration: 0.5,
    }).toActions(),
    new Character(null)
        .say("简体中文，繁體中文, 日本語, 한국어, ไทย, Tiếng Việt, हिन्दी, বাংলা, తెలుగు, मराठी, 1234567890!@#$%^&*()QWERTYUIOPASDFGHJKLZCVN{}|:\"<>?~`, A quick brown fox jumps over the lazy dog.")
        .toActions(),
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
    scene1.setSceneBackground("#35ffe5", {
        duration: 0.5
    }).toActions(),
    c2
        .say("那你愿不愿意陪我玩一个游戏？")
        .say("听好游戏规则")
        .say([new Word("我会思考一个介于 "), new Word("1 和 10", { color: "#f00" }), "之间的数字"])
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


