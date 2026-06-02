export class MoneyService {
    private balance: number;

    constructor(startingBalance = 0) {
        this.assertValidAmount(startingBalance);
        this.balance = startingBalance;
    }

    getBalance(): number {
        return this.balance;
    }

    canAfford(amount: number): boolean {
        this.assertValidAmount(amount);

        return this.balance >= amount;
    }

    spend(amount: number): boolean {
        this.assertValidAmount(amount);

        if (!this.canAfford(amount)) {
            return false;
        }

        this.balance -= amount;
        return true;
    }

    earn(amount: number): void {
        this.assertValidAmount(amount);

        this.balance += amount;
    }

    private assertValidAmount(amount: number): void {
        if (!Number.isInteger(amount) || amount < 0) {
            throw new Error(`Money amount must be a positive integer or zero. Received: ${amount}`);
        }
    }
}
