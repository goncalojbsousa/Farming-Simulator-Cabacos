const dayDuration = 130000;
const faintHour = 2;
const morningHour = 7;
const minutesPerDay = 24 * 60;

export type TimeSnapshot = {
    day: number;
    hour: number;
    minute: number;
};

export class TimeService {
    private lastUpdateTime: number | null = null;
    private currentMinute = morningHour * 60;

    day = 1;
    hour = morningHour;
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

    isFaintTime(): boolean {
        return this.hour === faintHour;
    }

    startNextDay(): void {
        this.day++;
        this.setMorningTime();
    }

    setMorningTime(): void {
        this.currentMinute = morningHour * 60;
        this.hour = morningHour;
        this.minute = 0;
        // The next update starts a fresh timer after the morning transition.
        this.lastUpdateTime = null;
    }

    getSnapshot(): TimeSnapshot {
        return {
            day: this.day,
            hour: this.hour,
            minute: this.minute
        };
    }

    loadSnapshot(snapshot: TimeSnapshot): void {
        this.day = snapshot.day;
        this.hour = snapshot.hour;
        this.minute = snapshot.minute;
        this.currentMinute = snapshot.hour * 60 + snapshot.minute;
        this.lastUpdateTime = null;
    }
}
