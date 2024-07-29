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
        .toActions()
]);

story.action([
    scene1
]);

export {
    story
}


