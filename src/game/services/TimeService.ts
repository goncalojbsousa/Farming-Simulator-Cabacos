const dayDuration = 60000;
const startingHour = 6;

export class TimeService {
    private startTime: number | null = null;

    day = 1;
    hour = startingHour;
    minute = 0;

    update(time: number): void {
        this.startTime ??= time;

        const elapsedTime = time - this.startTime;
        const minutesToday = Math.floor(
            (elapsedTime % dayDuration) / dayDuration * 24 * 60
        );
        const totalMinutes = startingHour * 60 + minutesToday;

        this.day = Math.floor(elapsedTime / dayDuration) + 1;
        this.hour = Math.floor(totalMinutes / 60) % 24;
        this.minute = totalMinutes % 60;
    }
}
