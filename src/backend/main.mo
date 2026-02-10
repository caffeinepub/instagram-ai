import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";

actor {
  // Include authorization and blob storage mixins
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // Public data types
  public type PublicProfile = {
    id : Principal;
    displayName : Text;
    bio : Text;
    followersCount : Nat;
    followingCount : Nat;
    postsCount : Nat;
  };

  public type Comment = {
    author : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  public type Post = {
    author : Principal;
    caption : Text;
    image : Storage.ExternalBlob;
    timestamp : Time.Time;
    id : Nat;
    likes : [Principal];
    comments : [Comment];
  };

  // Internal data types
  type InternalProfile = {
    displayName : Text;
    bio : Text;
    followers : List.List<Principal>;
    following : List.List<Principal>;
    posts : List.List<Nat>;
  };

  type InternalPost = {
    author : Principal;
    caption : Text;
    image : Storage.ExternalBlob;
    timestamp : Time.Time;
    id : Nat;
    likes : List.List<Principal>;
    comments : List.List<Comment>;
  };

  // Persistent storage structures
  let profiles = Map.empty<Principal, InternalProfile>();
  let posts = Map.empty<Nat, InternalPost>();
  var nextPostId = 0;

  // Profile Management
  public shared ({ caller }) func createOrUpdateProfile(displayName : Text, bio : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create or update profiles");
    };

    let emptyFollowers = List.empty<Principal>();
    let emptyFollowing = List.empty<Principal>();
    let emptyPosts = List.empty<Nat>();

    let updatedProfile : InternalProfile = {
      displayName;
      bio;
      followers = emptyFollowers;
      following = emptyFollowing;
      posts = emptyPosts;
    };

    profiles.add(caller, updatedProfile);
  };

  public query ({ caller }) func getProfile(user : Principal) : async PublicProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (profiles.get(user)) {
      case (null) {
        Runtime.trap("No profile found");
      };
      case (?profile) {
        {
          id = user;
          displayName = profile.displayName;
          bio = profile.bio;
          followersCount = profile.followers.size();
          followingCount = profile.following.size();
          postsCount = profile.posts.size();
        };
      };
    };
  };

  // Post Management
  public shared ({ caller }) func createPost(caption : Text, image : Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let postId = nextPostId;
    nextPostId += 1;

    let newPost : InternalPost = {
      author = caller;
      caption;
      image;
      timestamp = Time.now();
      id = postId;
      likes = List.empty<Principal>();
      comments = List.empty<Comment>();
    };

    posts.add(postId, newPost);

    // Add post ID to user's profile
    switch (profiles.get(caller)) {
      case (null) {
        // If the user has no profile, create one
        let emptyFollowers = List.empty<Principal>();
        let emptyFollowing = List.empty<Principal>();
        let newPosts = List.fromArray<Nat>([postId]);
        let newProfile : InternalProfile = {
          displayName = "";
          bio = "";
          followers = emptyFollowers;
          following = emptyFollowing;
          posts = newPosts;
        };
        profiles.add(caller, newProfile);
      };
      case (?profile) {
        let userPosts = profile.posts.clone();
        userPosts.add(postId);
        let updatedProfile : InternalProfile = {
          displayName = profile.displayName;
          bio = profile.bio;
          followers = profile.followers;
          following = profile.following;
          posts = userPosts;
        };
        profiles.add(caller, updatedProfile);
      };
    };

    postId;
  };

  public query ({ caller }) func getPost(postId : Nat) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    switch (posts.get(postId)) {
      case (null) { Runtime.trap("Post not found") };
      case (?internalPost) {
        {
          author = internalPost.author;
          caption = internalPost.caption;
          image = internalPost.image;
          timestamp = internalPost.timestamp;
          id = internalPost.id;
          likes = internalPost.likes.toArray();
          comments = internalPost.comments.toArray();
        };
      };
    };
  };

  public query ({ caller }) func getPostsByUser(user : Principal) : async [Post] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view posts");
    };

    switch (profiles.get(user)) {
      case (null) {
        Runtime.trap("User has no profile");
      };
      case (?profile) {
        let postsByUser = profile.posts.toArray().map(
          func(postId) {
            switch (posts.get(postId)) {
              case (null) { Runtime.trap("Post not found") };
              case (?internalPost) {
                {
                  author = internalPost.author;
                  caption = internalPost.caption;
                  image = internalPost.image;
                  timestamp = internalPost.timestamp;
                  id = internalPost.id;
                  likes = internalPost.likes.toArray();
                  comments = internalPost.comments.toArray();
                };
              };
            };
          }
        );
        postsByUser;
      };
    };
  };

  // Follow/Unfollow
  public shared ({ caller }) func follow(userToFollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    switch (profiles.get(userToFollow)) {
      case (null) {
        Runtime.trap("User to follow does not exist");
      };
      case (?followeeProfile) {
        let followeeFollowers = followeeProfile.followers.clone();
        followeeFollowers.add(caller);
        let updatedFollowee : InternalProfile = {
          displayName = followeeProfile.displayName;
          bio = followeeProfile.bio;
          followers = followeeFollowers;
          following = followeeProfile.following;
          posts = followeeProfile.posts;
        };
        profiles.add(userToFollow, updatedFollowee);
      };
    };

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Your profile does not exist");
      };
      case (?followerProfile) {
        let followerFollowing = followerProfile.following.clone();
        followerFollowing.add(userToFollow);
        let updatedFollower : InternalProfile = {
          displayName = followerProfile.displayName;
          bio = followerProfile.bio;
          followers = followerProfile.followers;
          following = followerFollowing;
          posts = followerProfile.posts;
        };
        profiles.add(caller, updatedFollower);
      };
    };
  };

  public shared ({ caller }) func unfollow(userToUnfollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can unfollow others");
    };

    switch (profiles.get(userToUnfollow)) {
      case (null) {
        Runtime.trap("User to unfollow does not exist");
      };
      case (?followeeProfile) {
        let followeeFollowers = followeeProfile.followers.clone();
        let filteredFollowers = followeeFollowers.filter(func(follower) { follower != caller });
        let updatedFollowee : InternalProfile = {
          displayName = followeeProfile.displayName;
          bio = followeeProfile.bio;
          followers = filteredFollowers;
          following = followeeProfile.following;
          posts = followeeProfile.posts;
        };
        profiles.add(userToUnfollow, updatedFollowee);
      };
    };

    switch (profiles.get(caller)) {
      case (null) {
        Runtime.trap("Your profile does not exist");
      };
      case (?followerProfile) {
        let followerFollowing = followerProfile.following.clone();
        let filteredFollowing = followerFollowing.filter(
          func(following) { following != userToUnfollow }
        );
        let updatedFollower : InternalProfile = {
          displayName = followerProfile.displayName;
          bio = followerProfile.bio;
          followers = followerProfile.followers;
          following = filteredFollowing;
          posts = followerProfile.posts;
        };
        profiles.add(caller, updatedFollower);
      };
    };
  };

  // Likes and Comments
  public shared ({ caller }) func likePost(postId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    switch (posts.get(postId)) {
      case (null) {
        Runtime.trap("Post does not exist");
      };
      case (?internalPost) {
        let postLikes = internalPost.likes.clone();
        postLikes.add(caller);
        let updatedPost : InternalPost = {
          author = internalPost.author;
          caption = internalPost.caption;
          image = internalPost.image;
          timestamp = internalPost.timestamp;
          id = internalPost.id;
          likes = postLikes;
          comments = internalPost.comments;
        };
        posts.add(postId, updatedPost);
      };
    };
  };

  public shared ({ caller }) func addComment(postId : Nat, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on posts");
    };

    switch (posts.get(postId)) {
      case (null) {
        Runtime.trap("Post does not exist");
      };
      case (?internalPost) {
        let newComment : Comment = {
          author = caller;
          text;
          timestamp = Time.now();
        };
        let postComments = internalPost.comments.clone();
        postComments.add(newComment);
        let updatedPost : InternalPost = {
          author = internalPost.author;
          caption = internalPost.caption;
          image = internalPost.image;
          timestamp = internalPost.timestamp;
          id = internalPost.id;
          likes = internalPost.likes;
          comments = postComments;
        };
        posts.add(postId, updatedPost);
      };
    };
  };

  // Profile Discovery
  module PublicProfile {
    public func compare(profile1 : PublicProfile, profile2 : PublicProfile) : Order.Order {
      Text.compare(profile1.displayName, profile2.displayName);
    };
  };

  public query ({ caller }) func searchProfiles(_searchTerm : Text) : async [PublicProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search profiles");
    };

    let publicProfiles = profiles.toArray().map(
      func((user, profile)) {
        {
          id = user;
          displayName = profile.displayName;
          bio = profile.bio;
          followersCount = profile.followers.size();
          followingCount = profile.following.size();
          postsCount = profile.posts.size();
        };
      }
    );
    publicProfiles.sort();
  };
};
