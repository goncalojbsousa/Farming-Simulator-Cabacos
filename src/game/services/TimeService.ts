const dayDuration = 60000;
const startingHour = 6;
const minutesPerDay = 24 * 60;

export class TimeService {
    private lastUpdateTime: number | null = null;
    private currentMinute = startingHour * 60;

    day = 1;
    hour = startingHour;
    minute = 0;

    update(time: number): void {
        if (this.lastUpdateTime === null) {
            this.lastUpdateTime = time;
            return;
        }

        const elapsedTime = time - this.lastUpdateTime;
        this.lastUpdateTime = time;
        this.currentMinute += elapsedTime / dayDuration * minutesPerDay;

        while (this.currentMinute >= minutesPerDay) {
            this.currentMinute -= minutesPerDay;
            this.day++;
        }

        this.hour = Math.floor(this.currentMinute / 60);
        this.minute = Math.floor(this.currentMinute % 60);
    }

    advanceDay(): void {
        this.day++;
    }

    startNextDay(): void {
        this.day++;
        this.currentMinute = 7 * 60;
        this.hour = 7;
        this.minute = 0;
        // The next update starts a fresh timer after the sleep transition.
        this.lastUpdateTime = null;
    }
}
