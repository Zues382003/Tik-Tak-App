export type Notifications = {
    id: number,
    userEmail: string,
    notificationText: string,
    isRead: boolean,
    idComment: number,
    pushCommentEmail: string,
    created_at: Date
}