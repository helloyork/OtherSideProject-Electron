import { Character, Sentence, Word } from "../game/elements/text";
import { Condition, Lambda } from "../game/elements/condition";
import { Image } from "../game/elements/image";
import { Menu } from "../game/elements/menu";
import { Scene } from "../game/elements/scene";
import { Script } from "../game/elements/script";
import { Story } from "../game/elements/story";
import { Game, LogicNode } from "../game/game";

const E = new Character("Eileen");
const M = new Character("Me");

const story = new Story("test");

const eileenImage = new Image("Eileen", {
    src: "/static/images/eileen-happy.png"
});

// const game = new Game({});
// const liveGame = game.createLiveGame();

const scene2 = new Scene("scene2", {})
    .action([]);

const scene1 = new Scene("scene1", {})
    .action([
        M
            .say("Hello, World!")
            .say("How are you?")
            .toActions(),
        eileenImage
            .show()
            .toActions(),
        E
            .say("I'm good, thank you!")
            .say(new Sentence(E, "Do you want to play a game?", { color: "#fff" }))
            .say(["I'm thinking of a number between ", new Word("1 and 10", { color: "#f00" }), ", can you guess it?"])
            .toActions(),

        eileenImage
            .set("/static/images/eileen-wonder.png")
            .toActions(),
        M
            .say("What is it?")
            .toActions(),
        // new Script(function (ctx) {
        //     const token = liveGame.storable.getNamespace("player")
        //         .startTransaction()
        //         .set("coin", 0)
        //         .commit();
        //     return () => {
        //         if (token) liveGame.storable.getNamespace("player").undo(token);
        //     }
        // })
        //     .toActions(),
            
        new Condition()
            .If(
                new Lambda(
                    ({
                        resolve
                    }) => (resolve(), () => { })
                ),
                M.say("It's 5!").toActions()
            )
            .ElseIf(
                new Lambda(
                    ({
                        resolve
                    }) => (resolve(), () => { })
                ),
                M.say("It's 7!").toActions()
            )
            .Else(
                M.say("I don't know!").toActions()
            )
            .toActions(),
        scene2,
        new Menu("hello")
            .choose({
                prompt: "Hello",
                action: []
            })
            .toActions()
    ]);

story.action([scene1]);

// story.registerScene(scene1);
console.log(story);

export { story };
