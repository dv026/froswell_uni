export class ActiveCalculationsListener {
    private id: number;

    public start(action: () => void, frequency = 5000) {
        action();
        this.id = window.setInterval(() => {
            action();
        }, frequency);
    }

    public stop() {
        window.clearInterval(this.id);
    }
}
