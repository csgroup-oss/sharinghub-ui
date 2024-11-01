import Cookies from 'js-cookie';
import axios from 'axios';
import { buildQuery, buildURL, concatURL, getCleanURL, parseQuery, } from '@vssue/utils';
import { normalizeUser, normalizeIssue, normalizeComment, normalizeReactions, mapReactionName, } from './utils';
/**
 * GitLab API V4
 *
 * @see https://docs.gitlab.com/ce/api/
 * @see https://docs.gitlab.com/ce/api/oauth2.html
 */
export default class GitlabV4 {
    constructor({ baseURL = 'https://gitlab.com', owner, repo, labels, clientId, state, }) {
        this.baseURL = baseURL;
        this.owner = owner;
        this.repo = repo;
        this.labels = labels;
        this.clientId = clientId;
        this.state = state;
        // @see https://docs.gitlab.com/ce/api/README.html#namespaced-path-encoding
        this._encodedRepo = encodeURIComponent(`${this.repo}`);
        const CSRFTOKEN = Cookies.get('csrftoken') || '';
        const LOCAL_TOKEN = this.clientId || '';
        this.$http = axios.create({
            baseURL: baseURL,
            headers: {
                Accept: 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
                'X-CSRFToken': CSRFTOKEN,
                'X-Gitlab-Token': LOCAL_TOKEN,
            },
            withCredentials: true,
        });
    }
    /**
     * The platform api info
     */
    get platform() {
        return {
            name: 'GitLab',
            link: this.baseURL,
            version: 'v4',
            meta: {
                reactable: true,
                sortable: true,
            },
        };
    }
    /**
     * Redirect to the authorization page of platform.
     *
     * @see https://docs.gitlab.com/ce/api/oauth2.html#1-requesting-authorization-code
     */
    redirectAuth() {
        window.location.href = buildURL(concatURL(this.baseURL, 'oauth/authorize'), {
            client_id: this.clientId,
            redirect_uri: window.location.href,
            response_type: 'token',
            state: this.state,
        });
    }
    /**
     * Handle authorization.
     *
     * @see https://docs.gitlab.com/ce/api/oauth2.html#implicit-grant-flow
     *
     * @remarks
     * If the `access_token` and `state` exist in the query, and the `state` matches, remove them from query, and return the access token.
     */
    async handleAuth() {
        const hash = parseQuery(window.location.hash.slice(1));
        if (!hash.access_token || hash.state !== this.state) {
            return null;
        }
        const accessToken = hash.access_token;
        delete hash.access_token;
        delete hash.token_type;
        delete hash.expires_in;
        delete hash.state;
        const hashString = buildQuery(hash);
        const newHash = hashString ? `#${hashString}` : '';
        const replaceURL = `${getCleanURL(window.location.href)}${window.location.search}${newHash}`;
        window.history.replaceState(null, '', replaceURL);
        return accessToken;
    }
    /**
     * Get the logged-in user with access token.
     */
    async getUser({ accessToken, }) {
        const { data } = await this.$http.get('user', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        return normalizeUser(data);
    }
    async getUserByPrivateToken() {
        const { data } = await this.$http.get('user');
        const response = await this.$http.get('avatar?email='.concat(data.email));
        return normalizeUser(data, response.data.avatar_url);
    }
    async getAvatarUrlByUserid(userId) {
        if (!userId)
            throw new Error('userId is undefined');
        const { data: userData } = await this.$http.get('users/'.concat(userId));
        if (!userData)
            throw new Error('user undefined ');
        if (userData.email) {
            const response = await this.$http.get('avatar?email='.concat(userData.email));
            return response.data;
        }
        return Promise.resolve({ avatar_url: undefined });
    }
    /**
     * Get issue of this page according to the issue id or the issue title
     *
     * @see https://docs.gitlab.com/ce/api/issues.html#single-issue
     * @see https://docs.gitlab.com/ce/api/issues.html#list-issues
     * @see https://docs.gitlab.com/ce/api/README.html#pagination
     */
    async getIssue({ issueId, issueTitle, }) {
        const options = {};
        if (issueId) {
            try {
                const { data } = await this.$http.get(`projects/${this._encodedRepo}/issues/${issueId}`, options);
                return normalizeIssue(data);
            }
            catch (e) {
                if (e.response && e.response.status === 404) {
                    return null;
                }
                else {
                    throw e;
                }
            }
        }
        else {
            options.params = {
                // labels: this.labels.join(','),
                order_by: 'created_at',
                sort: 'asc',
                search: issueTitle,
            };
            const { data } = await this.$http.get(`projects/${this._encodedRepo}/issues`, options);
            const issue = data
                .map(normalizeIssue)
                .find(item => item.title === issueTitle);
            return issue || null;
        }
    }
    /**
     * Create a new issue
     *
     * @see https://docs.gitlab.com/ce/api/issues.html#new-issue
     */
    async postIssue({ title, content, }) {
        const { data } = await this.$http.post(`projects/${this._encodedRepo}/issues`, {
            title,
            description: content,
            labels: this.labels.join(','),
        });
        return normalizeIssue(data);
    }
    async closeIssue(issue) {
        const { data } = await this.$http.put(`projects/${this._encodedRepo}/issues/${issue.id}?state_event=close`, {});
        return normalizeIssue(data);
    }
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
    async getComments({ issueId, query: { page = 1, perPage = 10, sort = 'desc' } = {}, }) {
        const options = {
            params: {
                // pagination
                page: page,
                per_page: perPage,
                order_by: 'created_at',
                sort: sort,
            },
        };
        const response = await this.$http.get(`projects/${this._encodedRepo}/issues/${issueId}/notes`, options);
        const commentsRaw = response.data;
        // gitlab api v4 should get parsed markdown content and reactions by other api
        // this is potentially to cause 429 Too Many Requests
        const getCommentsMeta = [];
        for (const comment of commentsRaw) {
            getCommentsMeta.push((async () => {
                comment.body_html = await this.getMarkdownContent({
                    contentRaw: comment.body,
                });
            })());
            getCommentsMeta.push((async () => {
                comment.reactions = await this.getCommentReactions({
                    issueId: issueId,
                    commentId: comment.id,
                });
            })());
        }
        await Promise.all(getCommentsMeta);
        return {
            count: Number(response.headers['x-total']),
            page: Number(response.headers['x-page']),
            perPage: Number(response.headers['x-per-page']),
            data: commentsRaw.map(normalizeComment),
        };
    }
    /**
     * Create a new comment
     *
     * @see https://docs.gitlab.com/ce/api/notes.html#create-new-issue-note
     */
    async postComment({ issueId, content, }) {
        const { data } = await this.$http.post(`projects/${this._encodedRepo}/issues/${issueId}/notes`, {
            body: content,
        });
        return normalizeComment(data);
    }
    /**
     * Edit a comment
     *
     * @see https://docs.gitlab.com/ce/api/notes.html#modify-existing-issue-note
     */
    async putComment({ issueId, commentId, content, }) {
        const { data } = await this.$http.put(`projects/${this._encodedRepo}/issues/${issueId}/notes/${commentId}`, {
            body: content,
        });
        const [contentHTML, reactions] = await Promise.all([
            this.getMarkdownContent({
                contentRaw: data.body,
            }),
            this.getCommentReactions({
                issueId: issueId,
                commentId: data.id,
            }),
        ]);
        data.body_html = contentHTML;
        data.reactions = reactions;
        return normalizeComment(data);
    }
    /**
     * Delete a comment
     *
     * @see https://docs.gitlab.com/ce/api/notes.html#delete-an-issue-note
     */
    async deleteComment({ issueId, commentId, }) {
        const { status } = await this.$http.delete(`projects/${this._encodedRepo}/issues/${issueId}/notes/${commentId}`);
        return status === 204;
    }
    /**
     * Get reactions of a comment
     *
     * @see https://docs.gitlab.com/ce/api/award_emoji.html#list-an-awardables-award-emoji
     */
    async getCommentReactions({ issueId, commentId, }) {
        const { data } = await this.$http.get(`projects/${this._encodedRepo}/issues/${issueId}/notes/${commentId}/award_emoji`);
        return normalizeReactions(data);
    }
    /**
     * Create a new reaction of a comment
     *
     * @see https://docs.gitlab.com/ce/api/award_emoji.html#award-a-new-emoji
     */
    async postCommentReaction({ issueId, commentId, reaction, }) {
        try {
            const response = await this.$http.post(`projects/${this._encodedRepo}/issues/${issueId}/notes/${commentId}/award_emoji`, {
                name: mapReactionName(reaction),
            });
            return response.status === 201;
        }
        catch (e) {
            // it could be a bug of gitlab
            // if a reaction (award emoji) has already existed, it returns a 404 response with a buggy message
            // have submitted an issue: https://gitlab.com/gitlab-org/gitlab-ce/issues/56147
            /* istanbul ignore next */
            if (e.response && e.response.status === 404) {
                return false;
            }
            else {
                throw e;
            }
        }
    }
    /**
     * Get the parse HTML of markdown content
     *
     * @see https://docs.gitlab.com/ce/api/markdown.html
     */
    async getMarkdownContent({ contentRaw, }) {
        const options = {};
        const { data } = await this.$http.post(`markdown`, {
            text: contentRaw,
            gfm: true,
        }, options);
        return data.html;
    }
}
//# sourceMappingURL=index.js.map
