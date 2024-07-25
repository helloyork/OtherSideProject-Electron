
export enum NodeType {

}

export class Node {
    id: string;
    type: string;
    constructor(id: string, type: string) {
        this.id = id;
        this.type = type;
    }
}

type RenderableNode = ContentNode | TreeNode;

export class ContentNode extends Node {
    child: RenderableNode | null;
    parent: RenderableNode | null;
    constructor(id: string, type: string, child?: RenderableNode, parent?: RenderableNode | null) {
        super(id, type);
        this.child = child || null;
        this.parent = parent || null;
    }
    setParent(parent: RenderableNode) {
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
        if (child.parent !== this) {
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
}

export class TreeNode extends Node {
    children: RenderableNode[];
    parent: RenderableNode | null;
    constructor(id: string, type: string, children?: RenderableNode[], parent?: RenderableNode | null) {
        super(id, type);
        this.children = children || [];
        this.parent = parent || null;
    }
    setParent(parent: RenderableNode) {
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
}

// @todo: Implement
export class ForkNode extends TreeNode {}


