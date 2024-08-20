import { v4 as uuidv4 } from 'uuid'; // You'll need to install the uuid package

export enum ActionItemStatus {
    New = 'New',
    Pending = 'Pending',
    NextAction = 'Next Action',
    WaitingFor = 'Waiting For',
    Scheduled = 'Scheduled',
    Someday = 'Someday/Maybe',
    InProgress = 'In Progress',
    Completed = 'Completed',
    Delegated = 'Delegated',
    Archived = 'Archived',
    NotSelected = 'Not Selected'
}

export enum ActionItemPriority {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Urgent = 'Urgent'
}

export enum ActionItemContext {
    Home = 'Home',
    Work = 'Work',
    Errands = 'Errands',
    Calls = 'Calls',
    Computer = 'Computer',
    Anywhere = 'Anywhere',
    TeamChat = 'Team Chat',
    Email = 'Email',
    Meet = 'Meet',
    Chat = 'Chat',
    NotSelected = 'Not Selected'
}

export class ActionItem {
    key?: number; // For IndexedDB key
    id: string;
    title: string;
    description: string;
    status: ActionItemStatus;
    dueDate: string | null;
    priority: ActionItemPriority;
    context: string;
    project: string | null;
    whoFor: string | null;
    tags: string[];
    estimatedTime: number | null;
    actualTime: number | null;
    recurring: boolean;
    recurrencePattern: string | null;
    assignedTo: string | null;
    createdBy: string;
    createdDate: string; // Store as ISO string
    updatedBy: string | null;
    updatedDate: string | null; // Store as ISO string
    completedDate: string | null; // Store as ISO string
    notes: string | null;
    attachments: string[];
    parentActionId: string | null;
    subActions: string[]; // Store only IDs of sub-actions
    energy: number;
    isVisible: boolean;
    isDeleted: boolean = false;
    deletedDate: string | null = null;
    animate: boolean = false;

    constructor(
        title: string,
        description: string = '',
        status: ActionItemStatus = ActionItemStatus.New,
        priority: ActionItemPriority = ActionItemPriority.Medium,
        context: string = "Not Selected"
    ) {
        this.id = uuidv4();
        this.title = title;
        this.description = description;
        this.status = status;
        this.priority = priority;
        this.context = context;
        this.createdDate = new Date().toISOString();
        this.createdBy = 'Current User'; // Replace with actual user ID or name
        this.tags = [];
        this.whoFor = null;
        this.attachments = [];
        this.subActions = [];
        this.isVisible = true;
        this.recurring = false;
        this.animate = false;
        this.energy = 3; // Default to medium energy
    }

    complete(): void {
        this.status = ActionItemStatus.Completed;
        this.completedDate = new Date().toISOString();
        this.updateLastModified();
    }

    reopen(): void {
        this.status = ActionItemStatus.Pending;
        this.completedDate = null;
        this.updateLastModified();
    }

    updateLastModified(): void {
        this.updatedDate = new Date().toISOString();
        this.updatedBy = 'Current User'; // Replace with actual user ID or name
    }

    addTag(tag: string): void {
        if (!this.tags.includes(tag)) {
            this.tags.push(tag);
            this.updateLastModified();
        }
    }

    removeTag(tag: string): void {
        const index = this.tags.indexOf(tag);
        if (index > -1) {
            this.tags.splice(index, 1);
            this.updateLastModified();
        }
    }

    addAttachment(attachment: string): void {
        this.attachments.push(attachment);
        this.updateLastModified();
    }

    removeAttachment(attachment: string): void {
        const index = this.attachments.indexOf(attachment);
        if (index > -1) {
            this.attachments.splice(index, 1);
            this.updateLastModified();
        }
    }

    addSubAction(subActionId: string): void {
        this.subActions.push(subActionId);
        this.updateLastModified();
    }

    removeSubAction(subActionId: string): void {
        const index = this.subActions.indexOf(subActionId);
        if (index > -1) {
            this.subActions.splice(index, 1);
            this.updateLastModified();
        }
    }

    setRecurring(isRecurring: boolean, pattern: string | null = null): void {
        this.recurring = isRecurring;
        this.recurrencePattern = pattern;
        this.updateLastModified();
    }

    clone(): ActionItem {
        const clone = Object.assign(new ActionItem(''), this);
        clone.id = uuidv4();
        clone.key = undefined; // Reset key for new IndexedDB entry
        clone.createdDate = new Date().toISOString();
        clone.updatedDate = null;
        clone.completedDate = null;
        return clone;
    }

    isOverdue(): boolean {
        return this.dueDate ? new Date(this.dueDate) < new Date() && this.status !== ActionItemStatus.Completed : false;
    }

    getDaysUntilDue(): number | null {
        if (!this.dueDate) return null;
        const diffTime = new Date(this.dueDate).getTime() - new Date().getTime();
        return Math.ceil(diffTime / (1000 * 3600 * 24));
    }

    softDelete() {
        this.isDeleted = true;
        this.deletedDate = new Date().toISOString();
    }

    restore() {
        this.isDeleted = false;
        this.deletedDate = null;
    }

    static fromJSON(json: any): ActionItem {
        const actionItem = new ActionItem(json.title);
        Object.assign(actionItem, json);
        return actionItem;
    }

    static fromObject(obj: any): ActionItem {
        const item = new ActionItem(obj.title);
        Object.assign(item, obj);
        item.animate = obj.animate || false;
        return item;
    }
}