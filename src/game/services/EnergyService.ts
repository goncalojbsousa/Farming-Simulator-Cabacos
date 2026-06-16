const maxEnergy = 100;
const faintEnergy = 25;

export class EnergyService {
    private energy = maxEnergy;

    getEnergy(): number {
        return this.energy;
    }

    getMaxEnergy(): number {
        return maxEnergy;
    }

    setEnergy(energy: number): void {
        this.energy = Math.max(0, Math.min(maxEnergy, energy));
    }

    hasEnergy(amount: number): boolean {
        return this.energy >= amount;
    }

    spend(amount: number): void {
        this.energy = Math.max(0, this.energy - amount);
    }

    restoreAfterSleep(): void {
        this.energy = maxEnergy;
    }

    restoreAfterFaint(): void {
        this.energy = faintEnergy;
    }
}
