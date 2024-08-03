import type {Character, Sentence} from "@lib/game/game/elements/text";
import type {Scene} from "@lib/game/game/elements/scene";
import type {Story} from "@lib/game/game/elements/story";
import type {Image} from "@lib/game/game/elements/image";
import type {Condition} from "@lib/game/game/elements/condition";
import type {Script} from "@lib/game/game/elements/script";
import type {Menu} from "@lib/game/game/elements/menu";
import {Values} from "@lib/util/data";
import {
    CharacterAction,
    CharacterActionContentType,
    CharacterActionTypes,
    ConditionAction,
    ConditionActionContentType,
    ConditionActionTypes,
    ImageAction,
    ImageActionContentType,
    ImageActionTypes,
    MenuAction,
    MenuActionContentType,
    MenuActionTypes,
    SceneAction,
    SceneActionContentType,
    SceneActionTypes,
    ScriptAction,
    ScriptActionContentType,
    ScriptActionTypes,
    StoryAction,
    StoryActionContentType,
    StoryActionTypes,
    TypedAction
} from "@lib/game/game/actions";

export namespace LogicAction {
    export type GameElement = Character | Scene | Story | Sentence | Image | Condition | Script | Menu;
    export type Actions =
        CharacterAction<any>
        | ConditionAction<any>
        | ImageAction<any>
        | SceneAction<any>
        | ScriptAction<any>
        | StoryAction<any>
        | TypedAction<any, any, any>
        | MenuAction<any>;
    export type ActionTypes =
        Values<typeof CharacterActionTypes>
        | Values<typeof ConditionActionTypes>
        | Values<typeof ImageActionTypes>
        | Values<typeof SceneActionTypes>
        | Values<typeof ScriptActionTypes>
        | Values<typeof StoryActionTypes>
        | Values<typeof MenuActionTypes>;
    export type ActionContents =
        CharacterActionContentType
        & ConditionActionContentType
        & ImageActionContentType
        & SceneActionContentType
        & ScriptActionContentType
        & StoryActionContentType
        & MenuActionContentType;
}