import {deepMerge} from "@lib/util/data";
import {Game} from "../game";
import {ContentNode, RenderableNode} from "../save/rollback";
import {HistoryData} from "../save/transaction";
import {ScriptCleaner} from "./script";
import {LogicAction} from "@lib/game/game/logicAction";
import {ConditionAction} from "@lib/game/game/actions";
import {Actionable} from "@lib/game/game/actionable";
import {GameState} from "@lib/ui/components/player/gameState";

export type ConditionConfig = {};

interface LambdaCtx {
    gameState: GameState;
    resolve: (value?: any) => void;
}
type LambdaHandler = (ctx: LambdaCtx) => ScriptCleaner;

export class Lambda {
    handler: LambdaHandler;

    constructor(handler: LambdaHandler) {
        this.handler = handler;
    }

    evaluate({gameState}: { gameState: GameState }): {
        value: any;
        cleaner: ScriptCleaner;
    } {
        let value: any;
        let cleaner = this.handler(this.getCtx((v) => value = v, {gameState}));
        return {
            value,
            cleaner
        };
    }

    getCtx(resolve: (value: any) => void, {gameState}: { gameState: GameState }): LambdaCtx {
        return {
            resolve,
            gameState
        };
    }
}

export type ConditionData = {
    If: {
        condition: Lambda | null;
        action: LogicAction.Actions[] | null;
    };
    ElseIf: {
        condition: Lambda | null;
        action: (LogicAction.Actions[]) | null;
    }[];
    Else: {
        action: (LogicAction.Actions[]) | null;
    }
};

export class Condition extends Actionable {
    static defaultConfig: ConditionConfig = {};
    config: ConditionConfig;
    conditions: ConditionData = {
        If: {
            condition: null,
            action: null
        },
        ElseIf: [],
        Else: {
            action: null
        }
    };
    cleaner: ScriptCleaner | null = null;

    constructor(config: ConditionConfig = {}) {
        super();
        this.config = deepMerge<ConditionConfig>(Condition.defaultConfig, config);
    }

    If(condition: Lambda, action: LogicAction.Actions | LogicAction.Actions[]): this {
        this.conditions.If.condition = condition;
        this.conditions.If.action = this.construct(Array.isArray(action) ? action : [action]);
        return this;
    }

    ElseIf(condition: Lambda, action: (LogicAction.Actions | LogicAction.Actions[])): this {
        this.conditions.ElseIf.push({
            condition,
            action: this.construct(Array.isArray(action) ? action : [action])
        });
        return this;
    }

    Else(action: (LogicAction.Actions | LogicAction.Actions[])): this {
        this.conditions.Else.action = this.construct(Array.isArray(action) ? action : [action]);
        return this;
    }

    evaluate({gameState}: { gameState: GameState }): LogicAction.Actions[] | null {
        const ctx = {gameState};
        this.transaction.startTransaction();

        const _if = this.conditions.If.condition?.evaluate(ctx);
        if (_if?.value) {
            this.transaction.push({
                type: '',
                data: _if.cleaner
            }).commit();
            return this.conditions.If.action || null;
        }

        for (const elseIf of this.conditions.ElseIf) {
            const _elseIf = elseIf.condition?.evaluate(ctx);
            if (_elseIf?.value) {
                this.transaction.push({
                    type: '',
                    data: _elseIf.cleaner
                }).commit();
                return elseIf.action || null;
            }
        }

        this.transaction.commit();
        return this.conditions.Else.action || null;
    }

    undo(history: HistoryData<Record<string, string>>): void {
        if (typeof history.data === "function") {
            history.data();
        }
    }

    toActions(): LogicAction.Actions[] {
        return [
            Reflect.construct(ConditionAction, [
                this,
                ConditionAction.ActionTypes.action,
                new ContentNode<Condition>(
                    Game.getIdManager().getStringId(),
                ).setContent(this)
            ]) as ConditionAction<typeof ConditionAction.ActionTypes.action>
        ]
    }

    construct(actions: LogicAction.Actions[], lastChild?: RenderableNode, parentChild?: RenderableNode): LogicAction.Actions[] {
        for (let i = 0; i < actions.length; i++) {
            let node = actions[i].contentNode;
            let child = actions[i + 1]?.contentNode;
            if (child) {
                node.addChild(child);
            }
            if (i === actions.length - 1 && lastChild) {
                node.addChild(lastChild);
            }
            if (i === 0 && parentChild) {
                parentChild.addChild(node);
            }
        }
        return actions;
    }
}
