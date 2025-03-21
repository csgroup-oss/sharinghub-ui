// @ts-nocheck
export function normalizeUser(user, avatar_url = undefined) {
    return {
        username: user.username,
        avatar: user.avatar_url,
        homepage: user.web_url,
        avatar_url: avatar_url,
        id: user.id,
    };
}
export function normalizeIssue(issue) {
    return {
        id: issue.iid,
        title: issue.title,
        content: issue.description,
        link: issue.web_url,
        state: issue.state,
    };
}
export function normalizeComment(comment) {
    return {
        id: comment.id,
        content: comment.body_html || '',
        contentRaw: comment.body,
        author: normalizeUser(comment.author),
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
        reactions: comment.reactions,
    };
}
export function normalizeReactions(reactions) {
    return {
        like: reactions.filter(item => item.name === 'thumbsup').length,
        unlike: reactions.filter(item => item.name === 'thumbsdown').length,
        heart: reactions.filter(item => item.name === 'heart').length,
    };
}
export function mapReactionName(reaction) {
    if (reaction === 'like')
        return 'thumbsup';
    if (reaction === 'unlike')
        return 'thumbsdown';
    return reaction;
}
export default {
    normalizeUser,
    normalizeIssue,
    normalizeComment,
    normalizeReactions,
    mapReactionName,
};
//# sourceMappingURL=utils.js.map
