import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { PublicProfile, Post, ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

// Profile queries
export function useGetCurrentProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<PublicProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');
      try {
        const principal = identity.getPrincipal();
        return await actor.getProfile(principal);
      } catch (error: any) {
        if (error.message?.includes('No profile found')) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetProfile(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicProfile>({
    queryKey: ['profile', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      return await actor.getProfile(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useCreateOrUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ displayName, bio }: { displayName: string; bio: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createOrUpdateProfile(displayName, bio);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Post queries
export function useGetAllPosts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['allPosts'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      
      // Get all profiles
      const profiles = await actor.searchProfiles('');
      
      // Get posts for each user
      const allPostsPromises = profiles.map(async (profile) => {
        try {
          return await actor.getPostsByUser(profile.id);
        } catch {
          return [];
        }
      });
      
      const allPostsArrays = await Promise.all(allPostsPromises);
      const allPosts = allPostsArrays.flat();
      
      // Sort by timestamp descending (newest first)
      return allPosts.sort((a, b) => Number(b.timestamp - a.timestamp));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000, // 30 seconds
  });
}

export function useGetPost(postId: bigint) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post>({
    queryKey: ['post', postId.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.getPost(postId);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetPostsByUser(principalId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['userPosts', principalId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      return await actor.getPostsByUser(principal);
    },
    enabled: !!actor && !actorFetching && !!principalId,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caption, image }: { caption: string; image: ExternalBlob }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createPost(caption, image);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

// Like mutations
export function useLikePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      await actor.likePost(postId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

// Comment mutations
export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, text }: { postId: bigint; text: string }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addComment(postId, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      queryClient.invalidateQueries({ queryKey: ['post'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}

// Follow mutations
export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      await actor.follow(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (principalId: string) => {
      if (!actor) throw new Error('Actor not available');
      const principal = Principal.fromText(principalId);
      await actor.unfollow(principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Search
export function useSearchProfiles(searchTerm: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<PublicProfile[]>({
    queryKey: ['searchProfiles', searchTerm],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return await actor.searchProfiles(searchTerm);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 10000, // 10 seconds
  });
}
