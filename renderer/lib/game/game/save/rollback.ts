import { LogicNode } from "../game";

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
    type: NodeType.ContentNode;
    parent?: string | null;
}
export class ContentNode<T = any> extends Node<T> {
    child: RenderableNode | null;
    parent: RenderableNode | null;
    callee: LogicNode.Actions;
    constructor(
        id: string, 
        child?: RenderableNode, 
        parent?: RenderableNode | null, 
        callee?: LogicNode.Actions
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
        return {
            id: this.id,
            type: NodeType.ContentNode,
            parent: this.parent ? this.parent.id : null,
        };
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
}

export type TreeNodeData = {
    id: string;
    type: NodeType.TreeNode;
    parent?: string | null;
}
export class TreeNode extends Node {
    children: RenderableNode[];
    parent: RenderableNode | null;
    callee: LogicNode.Actions;
    constructor(id: string, type: string, children?: RenderableNode[], parent?: RenderableNode | null, callee?: LogicNode.Actions) {
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
            type: NodeType.TreeNode,
            parent: this.parent ? this.parent.id : null,
        };
    }
    hasChild() {
        return this.children.length > 0;
    }
}


