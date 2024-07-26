
export type HistoryData<Enum extends Record<string, any>> = {
    type: Enum[keyof Enum];
    data: any;
};
type TransactionData<Enum extends Record<string, any>> = {
    history: HistoryData<Enum>[];
};
type TransactionHandler<Enum extends Record<string, any>> = (data: HistoryData<Enum>) => void;

export class Transaction<Enum extends Record<string, any>> {
    private history: TransactionData<Enum>[] = [];
    private currentTransaction: TransactionData<Enum> | null = null;
    undoHandler: TransactionHandler<Enum>;

    constructor(undoHandler: TransactionHandler<Enum>) {
        this.undoHandler = undoHandler;
    }

    /**
     * Start a new transaction
     */
    startTransaction(): this {
        if (this.currentTransaction) {
            console.warn('Transaction already started');
            return this;
        }
        this.currentTransaction = {
            history: [],
        };
        return this;
    }
    /**
     * Commit the current transaction
     * @returns the token of the transaction
     */
    commit(): number | null {
        if (!this.currentTransaction) {
            console.warn('No transaction to commit');
            return null;
        }
        this.history.push(this.currentTransaction);
        this.currentTransaction = null;
        return this.history.length - 1;
    }
    /**
     * Undo a transaction
     * @param token the token of the transaction to undo
     */
    undo(token?: number) {
        if (token === undefined) {
            token = this.history.length - 1;
        }
        if (token < 0 || token >= this.history.length || !this.history[token]) {
            console.error('Invalid token');
            return;
        }
        const transaction = this.history[token];
        for (let i = transaction.history.length - 1; i >= 0; i--) {
            this.undoHandler(transaction.history[i]);
        }
    }

}

