import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface PublicProfile {
    id: Principal;
    bio: string;
    displayName: string;
    followersCount: bigint;
    followingCount: bigint;
    postsCount: bigint;
}
export type Time = bigint;
export interface Comment {
    text: string;
    author: Principal;
    timestamp: Time;
}
export interface Post {
    id: bigint;
    author: Principal;
    likes: Array<Principal>;
    timestamp: Time;
    caption: string;
    image: ExternalBlob;
    comments: Array<Comment>;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(postId: bigint, text: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(displayName: string, bio: string): Promise<void>;
    createPost(caption: string, image: ExternalBlob): Promise<bigint>;
    follow(userToFollow: Principal): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getPost(postId: bigint): Promise<Post>;
    getPostsByUser(user: Principal): Promise<Array<Post>>;
    getProfile(user: Principal): Promise<PublicProfile>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint): Promise<void>;
    searchProfiles(_searchTerm: string): Promise<Array<PublicProfile>>;
    unfollow(userToUnfollow: Principal): Promise<void>;
}
