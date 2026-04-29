// contract, every command must follow:
export interface Command {
    do(): void;
    undo(): void;
}