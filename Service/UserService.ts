import { supabase } from "@/app/Utils/SupabaseConfig";


const getUserById = async (id: number) => {
    try{
        const { data, error } = await supabase
        .from('Users')
        .select('id,name,email,username,profileImage,bio')
        .eq('id', id)
        .order('created_at', { ascending: true });

        

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    }catch(error){
        console.error("Unexpected error:", error);
    }
    
}

const getDataUserByEmail = async (userEmail: string) => {
    try{
        const { data, error } = await supabase
        .from('Users')
        .select('id,name,email,username,profileImage,bio')
        .eq('email', userEmail);

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    }catch(error){
        console.error("Unexpected error:", error);
    }
    
}


const UserService = { getUserById, getDataUserByEmail };
export { UserService };