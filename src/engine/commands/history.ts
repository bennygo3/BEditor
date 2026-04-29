import type { Command } from "./command";

export class CommandHistory {
    private undoStack: Command[] = []; // commands that have been executed and can be undone
    private redoStack: Command[] = []; // commands that were undone and can be undone

    execute(command: Command): void { 
        command.do();
        this.undoStack.push(command);
        this.redoStack = []; 
        // 1. run the action -> 2. remember it for undo -> 3. clear redo history
    }

    // above: execute() runs a command and stores it in undo history
    // this.redoStack = [] >When a new command is executed, redo history is cleared.

    undo(): void {
        const command = this.undoStack.pop();
        if (!command) return;

        command.undo();
        this.redoStack.push(command);

        // 1. take the latest command -> 2. reverse it -> 3. store it so redo can run it again
    }

    // undo() reverses the most recent command 

    redo(): void {
        const command = this.redoStack.pop();
        if (!command) return;

        command.do();
        this.undoStack.push(command);

        // 1. take the most recently undone command -> 2. do it again -> 3. put it back unto undo hx
    }

    // redo() re-runs the last undone command
}