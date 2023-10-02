import { VssueAPI } from 'vssue';
import { AxiosInstance } from 'axios';
/**
 * GitLab API V4
 *
 * @see https://docs.gitlab.com/ce/api/
 * @see https://docs.gitlab.com/ce/api/oauth2.html
 */
export default class GitlabV4 implements VssueAPI.Instance {
    baseURL: string;
    owner: string;
    repo: string;
    labels: Array<string>;
    clientId: string;
    state: string;
    $http: AxiosInstance;
    privateToken: string | undefined;
    private _encodedRepo;
    constructor({ baseURL, owner, repo, labels, clientId, state, privateToken, }: VssueAPI.Options);
    /**
     * The platform api info
     */
    get platform(): VssueAPI.Platform;
    /**
     * Redirect to the authorization page of platform.
     *
     * @see https://docs.gitlab.com/ce/api/oauth2.html#1-requesting-authorization-code
     */
    redirectAuth(): void;
    /**
     * Handle authorization.
     *
     * @see https://docs.gitlab.com/ce/api/oauth2.html#implicit-grant-flow
     *
     * @remarks
     * If the `access_token` and `state` exist in the query, and the `state` matches, remove them from query, and return the access token.
     */
    handleAuth(): Promise<VssueAPI.AccessToken>;
    /**
     * Get the logged-in user with access token.
     */
    getUser({ accessToken, }: {
        accessToken: VssueAPI.AccessToken;
    }): Promise<VssueAPI.User>;
    getUserByPrivateToken(): Promise<VssueAPI.User>;
    /**
     * Get issue of this page according to the issue id or the issue title
     *
     * @see https://docs.gitlab.com/ce/api/issues.html#single-issue
     * @see https://docs.gitlab.com/ce/api/issues.html#list-issues
     * @see https://docs.gitlab.com/ce/api/README.html#pagination
     */
    getIssue({ accessToken, issueId, issueTitle, }: {
        accessToken: VssueAPI.AccessToken;
        issueId?: string | number;
        issueTitle?: string;
    }): Promise<VssueAPI.Issue | null>;
    /**
     * Create a new issue
     *
     * @see https://docs.gitlab.com/ce/api/issues.html#new-issue
     */
    postIssue({ accessToken, title, content, }: {
        accessToken: VssueAPI.AccessToken;
        title: string;
        content: string;
    }): Promise<VssueAPI.Issue>;
    /**
     * Get comments of this page according to the issue id
     *
     * @see https://docs.gitlab.com/ce/api/notes.html#list-project-issue-notes
     * @see https://docs.gitlab.com/ce/api/README.html#pagination
     *
     * @remarks
     * Cannot get the HTML content and the reactions (award_emoji) here.
     * So have to request them via `markdown` and `award_emoji` API.
     */
    getComments({ accessToken, issueId, query: { page, perPage, sort }, }: {
        accessToken: VssueAPI.AccessToken;
        issueId: string | number;
        query?: Partial<VssueAPI.Query>;
    }): Promise<VssueAPI.Comments>;
    /**
     * Create a new comment
     *
     * @see https://docs.gitlab.com/ce/api/notes.html#create-new-issue-note
     */
    postComment({ accessToken, issueId, content, }: {
        accessToken: VssueAPI.AccessToken;
        issueId: string | number;
        content: string;
    }): Promise<VssueAPI.Comment>;
    /**
     * Edit a comment
     *
     * @see https://docs.gitlab.com/ce/api/notes.html#modify-existing-issue-note
     */
    putComment({ accessToken, issueId, commentId, content, }: {
        accessToken: VssueAPI.AccessToken;
        issueId: string | number;
        commentId: string | number;
        content: string;
    }): Promise<VssueAPI.Comment>;
    /**
     * Delete a comment
     *
     * @see https://docs.gitlab.com/ce/api/notes.html#delete-an-issue-note
     */
    deleteComment({ accessToken, issueId, commentId, }: {
        accessToken: VssueAPI.AccessToken;
        issueId: string | number;
        commentId: string | number;
    }): Promise<boolean>;
    /**
     * Get reactions of a comment
     *
     * @see https://docs.gitlab.com/ce/api/award_emoji.html#list-an-awardables-award-emoji
     */
    getCommentReactions({ accessToken, issueId, commentId, }: {
        accessToken: VssueAPI.AccessToken;
        issueId: string | number;
        commentId: string | number;
    }): Promise<VssueAPI.Reactions>;
    /**
     * Create a new reaction of a comment
     *
     * @see https://docs.gitlab.com/ce/api/award_emoji.html#award-a-new-emoji
     */
    postCommentReaction({ issueId, commentId, reaction, accessToken, }: {
        accessToken: VssueAPI.AccessToken;
        issueId: string | number;
        commentId: string | number;
        reaction: keyof VssueAPI.Reactions;
    }): Promise<boolean>;
    /**
     * Get the parse HTML of markdown content
     *
     * @see https://docs.gitlab.com/ce/api/markdown.html
     */
    getMarkdownContent({ accessToken, contentRaw, }: {
        accessToken?: string | null;
        contentRaw: string;
    }): Promise<string>;
}
