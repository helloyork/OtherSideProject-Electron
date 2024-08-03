import {LogicAction} from "@lib/game/game/logicAction";

export enum NodeType {
    TreeNode = "TreeNode",
    ContentNode = "ContentNode",
}

export class Node<C = any> {
    id: string;
    type: string;
    content: C | undefined;
    constructor(id: string, type: string) {
        this.id = id;
        this.type = type;
        this.content = undefined;
    }
    setContent(content: C) {
        this.content = content;
        return this;
    }
    getContent() {
        return this.content;
    }
}

export type RenderableNode = ContentNode | TreeNode;
export type RenderableNodeData = ContentNodeData | TreeNodeData;

export type ContentNodeData = {
    id: string;
    data: any;
}
export class ContentNode<T = any> extends Node<T> {
    child: RenderableNode | null;
    parent: RenderableNode | null;
    callee: LogicAction.Actions;
    constructor(
        id: string, 
        child?: RenderableNode, 
        parent?: RenderableNode | null, 
        callee?: LogicAction.Actions
    ) {
        super(id, NodeType.ContentNode);
        this.child = child || null;
        this.parent = parent || null;
        this.callee = callee
    }
    setParent(parent: RenderableNode | null) {
        if (parent === this) {
            throw new Error('Cannot set parent to itself');
        }
        this.parent = parent;
        return this;
    }
    setChild(child: RenderableNode) {
        if (child === this) {
            throw new Error('Cannot set child to itself');
        }
        this.child = child;
        if (child && child.parent !== this) {
            child.remove().setParent(this);
        }
        return this;
    }
    /**
     * For chaining
     */
    addChild(child: RenderableNode) {
        this.setChild(child);
        return this;
    }
    removeChild(child: RenderableNode | null) {
        if (child && this.child === child) {
            this.child = null;
            child.setParent(null);
        } else if (!child) {
            this.child = null;
        }
        return this;
    }
    /**
     * Remove this node from the parent's children
     */
    remove() {
        this.parent?.removeChild(this);
        return this;
    }
    toData(): RenderableNodeData {
        const content = this.getContent();
        return {
            id: this.id,

            // use toData if it exists
            data: (typeof content === 'object' && content !== null) ? 
                (typeof content["toData"] === "function" ? content["toData"] : content) : content,
        };
    }
    fromData(data: RenderableNodeData) {
        const content = this.getContent();
        if (
            typeof content === 'object' 
            && content !== null 
            && typeof content["fromData"] === "function"
        ) {
            content["fromData"](content);
        } else {
            this.setContent(data.data);
        }
        return this;
    }
    hasChild() {
        return !!this.child;
    }
}

export class RootNode extends ContentNode {
    constructor() {
        super('root');
    }
    setParent(_: RenderableNode | null): this {
        throw new Error('Cannot set parent of root node');
    }
    remove(): this {
        throw new Error('Cannot remove root node');
    }
    forEach(callback: (node: RenderableNode) => void) {
        const queue = [this.child];
        while (queue.length > 0) {
            const node = queue.shift();
            if (!node) {
                continue;
            }
            callback(node);
            if (node instanceof TreeNode) {
                queue.push(...node.children);
            } else if (node instanceof ContentNode) {
                queue.push(node.child);
            }
        }
        return void 0;
    }
}

export type TreeNodeData = {
    id: string;
    data: any;
}
export class TreeNode extends Node {
    children: RenderableNode[];
    parent: RenderableNode | null;
    callee: LogicAction.Actions;
    constructor(id: string, type: string, children?: RenderableNode[], parent?: RenderableNode | null, callee?: LogicAction.Actions) {
        super(id, type);
        this.children = children || [];
        this.parent = parent || null;
        this.callee = callee;
    }
    setParent(parent: RenderableNode | null) {
        if (parent === this) {
            throw new Error('Cannot set parent to itself');
        }
        this.parent = parent;
        return this;
    }
    addChild(child: RenderableNode) {
        if (child === this) {
            throw new Error('Cannot add node to itself');
        }
        this.children.push(child);
        if (child.parent !== this) {
            child.remove().setParent(this);
        }
        return this;
    }
    removeChild(child: RenderableNode) {
        this.children = this.children.filter(c => {
            if (c === child) {
                c.setParent(null);
            }
            return c !== child;
        });
        return this;
    }
    /**
     * Remove this node from the parent's children
     */
    remove() {
        this.parent?.removeChild(this);
        return this;
    }
    toData(): RenderableNodeData {
        return {
            id: this.id,
            data: this.children.map(c => c?.toData ? c.toData() : null),
        };
    }
    hasChild() {
        return this.children.length > 0;
    }
}


