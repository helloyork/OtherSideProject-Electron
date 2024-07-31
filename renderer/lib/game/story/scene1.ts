import { Character, Sentence, Word } from "../game/elements/text";
import { Scene } from "../game/elements/scene";
import { Story } from "../game/elements/story";
import { Menu } from "../game/elements/menu";

const story = new Story("test");
const c1 = new Character("还没有名字");
const c2 = new Character("我");
const scene1 = new Scene("scene1").action([
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
    c2
        .say("那你愿不愿意陪我玩一个游戏？")
        .say("听好游戏规则")
        .say([new Word("我会思考一个介于 "), new Word("1 和 10", { color: "#f00" }), "之间的数字"])
        .say("你要猜这个数字是多少")
        .say("简体中文，繁體中文, 日本語, 한국어, ไทย, Tiếng Việt, हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், اردو, ಕನ್ನಡ, മലയാളം, සිංහල, ລາວ, မြန်မာ, ខ្មែរ, ພາສາລາວ, ქართული, Հայերեն, اُردو, پښتو, سنڌي, فارسی, عربي, עברית, ייִדיש, Ελληνικά, Български, Русский, Српски, Українська, ქართული, მარგალური, აფხაზური, ქართული, იმერული, ლაზური, სვანური, აჭარული, თუშური, ბათუმული, ქართული, ადიგეული, ახალქალაქური, ქართული, ქახეთი,")
        .toActions()
]);

story.action([
    scene1
]);

export {
    story
}


