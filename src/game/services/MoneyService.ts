export class MoneyService {
    private changeCallbacks: (() => void)[] = [];

    constructor(private balance = 0) {}

    getBalance(): number {
        return this.balance;
    }

    canAfford(amount: number): boolean {
        return this.balance >= amount;
    }

    spend(amount: number): void {
        this.balance -= amount;
        this.notifyChange();
    }

    earn(amount: number): void {
        this.balance += amount;
        this.notifyChange();
    }

    onChange(callback: () => void): () => void {
        this.changeCallbacks.push(callback);

        return () => {
            this.changeCallbacks = this.changeCallbacks.filter((savedCallback) =>
                savedCallback !== callback
            );
        };
    }

    private notifyChange(): void {
        for (const callback of this.changeCallbacks) {
            callback();
        }
    }
}
