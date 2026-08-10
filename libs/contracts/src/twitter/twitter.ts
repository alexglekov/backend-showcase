/* eslint-disable */
import { Observable } from "rxjs";

export const protobufPackage = "twitter";

export interface CountAccountTweetsAndLikesOnTweetsPayload {
  twitterId: string;
  mentions: string[];
}

export interface CountAccountTweetsAndLikesOnTweetsResult {
  countTweets: number;
  countLikesOnTweets: number;
}

export interface CountLikedTweetsByAccountPayload {
  twitterId: string;
}

export interface CountLikedTweetsByAccountResult {
  countLikedTweets: number;
  twitterId: string;
}

export interface IsTweetRetweetedByAccountPayload {
  tweetId: string;
  twitterId: string;
}

export interface IsTweetRetweetedByAccountResult {
  isRetweeted: boolean;
  tweetId: string;
  twitterId: string;
}

export interface GetOAuth2UriPayload {
  redirectUri: string;
}

export interface LoginWithOAuth2Payload {
  code: string;
  redirectUri: string;
  codeVerifier: string;
}

export interface TwitterOAuth2 {
  url: string;
  state: string;
  codeVerifier: string;
}

export interface GetAccountByIdPayload {
  twitterId: string;
}

export interface TwitterAccount {
  id: string;
  name: string;
  username: string;
  description?: string | undefined;
  profileImageUrl?: string | undefined;
}

export interface Void {
}

export interface TwitterService {
  getOAuth2Uri(request: GetOAuth2UriPayload): Observable<TwitterOAuth2>;
  loginWithOAuth2(request: LoginWithOAuth2Payload): Observable<TwitterAccount>;
  getAccountById(request: GetAccountByIdPayload): Observable<TwitterAccount>;
  /** Work with twitter */
  isTweetRetweetedByAccount(request: IsTweetRetweetedByAccountPayload): Observable<IsTweetRetweetedByAccountResult>;
  countLikedTweetsByAccount(request: CountLikedTweetsByAccountPayload): Observable<CountLikedTweetsByAccountResult>;
  countAccountTweetsAndLikesOnTweets(
    request: CountAccountTweetsAndLikesOnTweetsPayload,
  ): Observable<CountAccountTweetsAndLikesOnTweetsResult>;
}
