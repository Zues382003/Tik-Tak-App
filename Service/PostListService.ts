import { supabase } from "@/app/Utils/SupabaseConfig";

const getUserPosts = async () => {
    try {
        const { data, error } = await supabase
            .from('PostList')
            .select('*, Users(*), VideoLikes(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    } catch (error) {
        console.error("Unexpected error:", error);
    }
};

const getUserPostById = async (id: number) => {
    try {
        const { data, error } = await supabase
            .from('PostList')
            .select('*, Users(*), VideoLikes(*)')
            .eq('id',id)
            

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    } catch (error) {
        console.error("Unexpected error:", error);
    }
};

const getListVideoByEmail = async(email: string)=>{
    const { data, error } = await supabase
                .from('PostList')
                .select('*, Users(id, username, name, profileImage, email), VideoLikes(postIdRef, userEmail)')
                .order('created_at', { ascending: false })
                .eq('emailRef', email)

            if (error) {
                console.error("Error fetching data:", error);
                return;
            }
            return data;
}

const getUserPostsByEmail = async (userEmail: string) => {
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
        .select('id,name,email,username,profileImage,bio,facebook,youtube')
        .eq('email', userEmail);

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    }catch(error){
        console.error("Unexpected error:", error);
    }
    
}

const insertVideoPost = async(videoUrl: any, thumbnailUrl: any, description: any, emailRef: any) =>{
    try{
        const { data } = await supabase
        .from('PostList')
        .insert([
        {
            videoUrl: videoUrl,
            thumbnail: thumbnailUrl,
            description: description,
            emailRef: emailRef
        }
        ]);
    }catch(error){
        console.log(error);
    }
}

const getListVideoLikedByEmail = async (userEmail: string) => {
    try {
        // Step 1: Fetch the liked video IDs
        const { data: likedVideos, error: likeError } = await supabase
            .from('VideoLikes')
            .select('postIdRef') // Assuming postIdRef is the ID of the video in PostList
            .eq('userEmail', userEmail);

        if (likeError) {
            console.error("Error fetching liked video IDs:", likeError);
            return [];
        }

        // Step 2: Extract the IDs from the liked videos
        const likedVideoIds = likedVideos.map(video => video.postIdRef);

        // Step 3: Fetch the video details from PostList based on the liked video IDs
        const { data: videos, error: videoError } = await supabase
            .from('PostList')
            .select('*, Users(id, username, name, profileImage, email), VideoLikes(postIdRef, userEmail)')
            .in('id', likedVideoIds) // Use the array of IDs to filter
            .order('created_at', { ascending: false });

        if (videoError) {
            console.error("Error fetching videos by liked IDs:", videoError);
            return [];
        }


        return videos; // Return the array of video details
    } catch (error) {
        console.error("Unexpected error:", error);
        return [];
    }
}
const PostListService = { getUserPosts, getDataUser, getUserPostsByEmail, insertVideoPost, getListVideoByEmail, getListVideoLikedByEmail, getUserPostById };
export { PostListService };