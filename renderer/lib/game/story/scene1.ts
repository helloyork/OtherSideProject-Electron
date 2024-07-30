import { Character, Word } from "../game/elements/character";
import { Scene } from "../game/elements/scene";
import { Story } from "../game/elements/story";

const story = new Story("test");
const c1 = new Character("c1");
const c2 = new Character("c2");
const scene1 = new Scene("scene1").action([
    c1
        .say("Hello, world!")
        .say("How are you?")
        .toActions(),
    c2
        .say("I'm good, thank you!")
        .say("Do you want to play a game?")
        // .say("I'm thinking of a number between 1 and 10, can you guess it?")
        .say([new Word("I'm thinking of a number between "), new Word("1 and 10", { color: "#f00" }), ", can you guess it?"])
        .say("简体中文，繁體中文, 日本語, 한국어, ไทย, Tiếng Việt, हिन्दी, বাংলা, తెలుగు, मराठी, தமிழ், اردو, ಕನ್ನಡ, മലയാളം, සිංහල, ລາວ, မြန်မာ, ខ្មែរ, ພາສາລາວ, ქართული, Հայերեն, اُردو, پښتو, سنڌي, فارسی, عربي, עברית, ייִדיש, Ελληνικά, Български, Русский, Српски, Українська, ქართული, მარგალური, აფხაზური, ქართული, იმერული, ლაზური, სვანური, აჭარული, თუშური, ბათუმული, ქართული, ადიგეული, ახალქალაქური, ქართული, ქახეთი,")
        .toActions()
]);

story.action([
    scene1
]);

export {
    story
}


