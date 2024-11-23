import { supabase } from "@/app/Utils/SupabaseConfig";

const getFollowing = async (userEmail: string) => {
    try{
        const { data, error } = await supabase
        .from('Friends')
        .select('id,followedId,followerEmail')
        .eq('followerEmail', userEmail);

        if (error) {
            console.error("Error fetching Friends:", error);
        }

        return data;
    }catch(error){
        console.error("Unexpected error:", error);
    }
}

const getFollower = async (id: number) => {
    try{
        const { data, error } = await supabase
        .from('Friends')
        .select('id,followedId,followerEmail')
        .eq('followedId', id);

        if (error) {
            console.error("Error fetching Friends:", error);
        }

        return data;
    }catch(error){
        console.error("Unexpected error:", error);
    }
    
}

const insertFollow = async (followerEmail: string, followedId: number) => {
    try{
        const { error } = await supabase
            .from('Friends')
            .insert({
                followerEmail: followerEmail,
                followedId: followedId
                });

                if (error) {
                    console.error("Error fetching Friends:", error);
                }

    }catch(error){
        console.error("Unexpected error:", error);
    }
}

const deleteFollow = async (followerEmail: string, followedId: number) => {
    try{
        const { error } = await supabase
                    .from('Friends')
                    .delete()
                    .eq('followerEmail', followerEmail)
                    .eq('followedId', followedId);

                if (error) throw error;

        if (error) throw error;

    }catch(error){
        console.error("Unexpected error:", error);
    }
}

const checkFollow = async (followerEmail: string, followedId: number): Promise<boolean> => {
    try {
        const { data, error } = await supabase
            .from('Friends')
            .select('*')
            .eq('followerEmail', followerEmail)
            .eq('followedId', followedId);

        if (error) {
            console.error("Error checking follow relationship:", error);
            return false; 
        }

        return data && data.length > 0;
    } catch (error) {
        console.error("Unexpected error:", error);
        return false;
    }
}




const FriendService = { getFollowing, getFollower, insertFollow, deleteFollow, checkFollow };
export { FriendService };