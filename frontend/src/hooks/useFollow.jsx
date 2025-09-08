import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";



const useFollow = () => {
  const queryClient = useQueryClient();

  const { mutate: follow, isPending, error } = useMutation({
    mutationFn: async (userId) => {
      try {
        const res = await fetch(`/api/user/follow/${userId}`, {
          method: 'POST'
        })

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Couldn't follow user something went wrong")
        }

        return data;
      } catch (error) {
        throw error
      }
    },

    onSuccess: (data, userId) => {

      Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["suggestedUsers"]
        }),
        queryClient.invalidateQueries({
          queryKey: ["authUser"]
        }),
      ])

      // Update authUser cache
      queryClient.setQueryData(["authUser"], (old) => {
        if (!old) return old;
        const isFollowing = old.following.includes(userId);

        return {
          ...old,
          following: isFollowing
            ? old.following.filter((id) => id !== userId)
            : [...old.following, userId],
        };
      });

      // Update profile being viewed
      queryClient.setQueryData(["userProfile"], (old) => {
        if (!old) return old;
        const isFollowed = old.followers.includes(data.currentUserId);
        return {
          ...old,
          followers: isFollowed
            ? old.followers.filter((id) => id !== data.currentUserId)
            : [...old.followers, data.currentUserId],
        };
      });

    },

    onError: () => {
      toast.error(error.message)
    }
  })

  return { follow, isPending }
}


export default useFollow