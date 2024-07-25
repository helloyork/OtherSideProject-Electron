import { Character } from "./character";
import { Scene } from "./scene";
import { Sentence, Word } from "./sentence";
import { Story } from "./story";

const E = new Character("Eileen");
const M = new Character("Me");

const story = new Story("test");

const scene1 = new Scene("scene1", {})
    .action([
        M
            .say("Hello, World!")
            .say("How are you?"),
        E
            .say("I'm good, thank you!")

            // whole sentence will be white
            .say(new Sentence(E, "Do you want to play a game?", {
                color: "#fff"
            }))
            // only the word "1 and 10" will be red
            .say([
                "I'm thinking of a number between ",
                new Word("1 and 10", { color: "#f00" }),
                ", can you guess it?"
            ]),

        M
            .say("What is it?")
    ]);

story.action([scene1]);
console.log(story);
