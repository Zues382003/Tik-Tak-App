import { supabase } from "@/app/Utils/SupabaseConfig";

const getUserPosts = async (userEmail: string) => {
    try {
        const { data, error } = await supabase
            .from('PostList')
            .select('*, Users(*), VideoLikes(*)')
            .eq('emailRef', userEmail)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    } catch (error) {
        console.error("Unexpected error:", error);
    }
};

const getDataUser = async (userEmail: string) => {
    try{
        const { data, error } = await supabase
        .from('Users')
        .select('bio')
        .eq('email', userEmail);

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    }catch(error){
        console.error("Unexpected error:", error);
    }
    
}

const PostListService = { getUserPosts, getDataUser };
export { PostListService };