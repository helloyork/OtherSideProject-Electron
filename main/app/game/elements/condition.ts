import { deepMerge } from "../../../util/data";
import { Actionable } from "../constructable";
import { Game, LogicNode } from "../game";
import { ContentNode } from "../save/rollback";
import { HistoryData } from "../save/transaction";
import { ScriptCleaner } from "./script";

export type ConditionConfig = {};

interface LambdaCtx {
    resolve: (value?: any) => void;
};
type LambdaHandler = (ctx: LambdaCtx) => ScriptCleaner;

export class Lambda {
    handler: LambdaHandler;
    constructor(handler: LambdaHandler) {
        this.handler = handler;
    }
    evaluate(): {
        value: any;
        cleaner: ScriptCleaner;
    } {
        let value: any;
        let cleaner = this.handler(this.getCtx((v) => value = v));
        return {
            value,
            cleaner
        };
    }
    getCtx(resolve: (value: any) => void): LambdaCtx {
        return {
            resolve
        };
    }
}

export type ConditionData = {
    If: {
        condition: Lambda | null;
        action: LogicNode.Action[] | null;
    };
    ElseIf: {
        condition: Lambda | null;
        action: (LogicNode.Action[]) | null;
    }[];
    Else: {
        action: (LogicNode.Action[]) | null;
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
    If(condition: Lambda, action: LogicNode.Action | LogicNode.Action[]): this {
        this.conditions.If.condition = condition;
        this.conditions.If.action = Array.isArray(action) ? action : [action];
        return this;
    }
    ElseIf(condition: Lambda, action: (LogicNode.Action | LogicNode.Action[])): this {
        this.conditions.ElseIf.push({
            condition,
            action: Array.isArray(action) ? action : [action]
        });
        return this;
    }
    Else(action: (LogicNode.Action | LogicNode.Action[])): this {
        this.conditions.Else.action = Array.isArray(action) ? action : [action];
        return this;
    }
    evaluate(): LogicNode.Action[] | null {
        this.transaction.startTransaction();

        const _if = this.conditions.If.condition?.evaluate();
        if (_if?.value) {
            this.transaction.push({
                type: '',
                data: _if.cleaner
            }).commit();
            return this.conditions.If.action || null;
        }
    
        for (const elseIf of this.conditions.ElseIf) {
            const _elseIf = elseIf.condition?.evaluate();
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
    toActions(): LogicNode.Actions[] {
        return [
            Reflect.construct(LogicNode.ConditionAction, [
                this,
                LogicNode.ConditionAction.ActionTypes.action,
                new ContentNode<Condition>(
                    Game.getIdManager().getStringId(),
                ).setContent(this)
            ]) as LogicNode.ConditionAction<typeof LogicNode.ConditionAction.ActionTypes.action>
        ]
    }
}
