import type { Command } from "./command";

export class CommandHistory {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    execute(command: Command): void { 
        command.do();
        this.undoStack.push(command);
        this.redoStack = []; 
    }

    // above: execute() runs a command and stores it in undo history
    // this.redoStack = [] >When a new command is executed, redo history is cleared.

    undo(): void {
        const command = this.undoStack.pop();
        if (!command) return;

        command.undo();
        this.redoStack.push(command);
    }

    // undo() reverses the most recent command 

    redo(): void {
        const command = this.redoStack.pop();
        if (!command) return;

        command.do();
        this.undoStack.push(command);
    }

    // redo() re-runs the last undone command
}