export class MoneyService {
    constructor(private balance = 0) {}

    getBalance(): number {
        return this.balance;
    }

    canAfford(amount: number): boolean {
        return this.balance >= amount;
    }

    spend(amount: number): void {
        this.balance -= amount;
    }
}
