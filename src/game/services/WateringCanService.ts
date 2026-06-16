const maxWater = 3;

export class WateringCanService {
    private water = 0;

    getWater(): number {
        return this.water;
    }

    getMaxWater(): number {
        return maxWater;
    }

    setWater(water: number): void {
        this.water = Math.max(0, Math.min(maxWater, water));
    }

    fill(): void {
        this.water = maxWater;
    }

    useWater(): boolean {
        if (this.water === 0) {
            return false;
        }

        this.water--;
        return true;
    }
}
