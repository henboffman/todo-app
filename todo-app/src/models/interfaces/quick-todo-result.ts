import { ActionItemPriority } from "../action-item";

export interface QuickTodoResult {
    title: string;
    dueDate: string;
    priority: ActionItemPriority
}