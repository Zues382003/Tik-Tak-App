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

const updateAvatar = async (userEmail: string, profileImage: string) => {
    try{
        
        const { data, error } = await supabase
        .from('Users')
        .update({ profileImage: profileImage })
        .eq('email', userEmail)
        .select()
        

        if (error) {
            console.error("Error fetching user posts:", error);
        }

        return data;
    }catch(error){
        console.error("Unexpected error:", error);
    }
    
}

const updateDetail = async (label: string, dataUser: string, email: string) => {
    switch (label) {
        case 'name':
            try{
        
                const { data, error } = await supabase
                .from('Users')
                .update({ name: dataUser })
                .eq('email', email)
                .select()
                
        
                if (error) {
                    console.error("Error fetching user posts:", error);
                }
        
                return data;
            }catch(error){
                console.error("Unexpected error:", error);
            }
            break;
        case 'username':
            try{
        
                const { data, error } = await supabase
                .from('Users')
                .update({ username: dataUser })
                .eq('email', email)
                .select()
                
        
                if (error) {
                    console.error("Error fetching user posts:", error);
                }
        
                return data;
            }catch(error){
                console.error("Unexpected error:", error);
            }
            break;
        case 'bio':
            try{
        
                const { data, error } = await supabase
                .from('Users')
                .update({ bio: dataUser })
                .eq('email', email)
                .select()
                
        
                if (error) {
                    console.error("Error fetching user posts:", error);
                }
        
                return data;
            }catch(error){
                console.error("Unexpected error:", error);
            }
            break;
        case 'facebook':
            try{
        
                const { data, error } = await supabase
                .from('Users')
                .update({ facebook: dataUser })
                .eq('email', email)
                .select()
                
                if (error) {
                    console.error("Error fetching user posts:", error);
                }
        
                return data;
            }catch(error){
                console.error("Unexpected error:", error);
            }
            break;
        case 'youtube':
            try{
        
                const { data, error } = await supabase
                .from('Users')
                .update({ youtube: dataUser })
                .eq('email', email)
                .select()
                
        
                if (error) {
                    console.error("Error fetching user posts:", error);
                }
        
                return data;
            }catch(error){
                console.error("Unexpected error:", error);
            }
            break;
        
    }

    
}


const UserService = { getUserById, getDataUserByEmail,updateAvatar, updateDetail };
export { UserService };