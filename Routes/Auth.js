    import express from "express";
    import {createClient} from '@supabase/supabase-js';
    import dotenv from 'dotenv';
    dotenv.config();

    const router = express.Router();

    const supabase_url = process.env.SUPABASE_URL;
    const supabase_api = process.env.SUPABASE_API;
    const supabase = createClient(supabase_url, supabase_api);


    router.post('/signup', async(req,res) =>{
        console.warn("request reached")
        

        try{
            const {email,password,name} = req.body;

            if(!email|| !password || !name){
                return res.status(400).json({error: "All fields are required"});
            }
            console.warn("Before fake signup");
            await new Promise(res => setTimeout(res, 1000));
            console.warn("After fake signup");


            const {data,error} = await supabase.auth.signUp({
                email,
                password,
                options:{ 
                    data:{
                        Name:name,
                    }
                }
            });
            console.warn("halfway")
            if(error){
                return res.status(400).json({error:error.message});
            }
            console.warn("reached")
            const {error:profileError} = await supabase
                .from('Profiles')
                .insert({
                    //auth_id: data.user.id,
                    auth_id: data.user.id,
                    Name:name,
                    Email:email,
                    created_at: new Date(),
                });
                console.warn("Profile insert result", profileError);
            if(profileError){
                return res.status(400).json({error: profileError.message});
            }
            console.warn("Ending")
            return res.status(201).json({
                message: 'Account created successfully',
                user:data.user,
            });
        }
        catch(error){
            console.error("Server error",error);
            return res.status(500).json({error: "Internal server error"});
        }
    });

    router.post('/signin', async(req,res) => {
        console.warn("Request made")
        try{
            const{email,password} = req.body;
            console.warn(email,password)
            if(!email || !password){
                return res.status(400).json({error: "Email and password are required"});
            }
            console.warn("reaches sign in")
            const {data,error} = await supabase.auth.signInWithPassword({
                email,
                password
            });
            console.warn("Supabase signin:", data, error);


            if(error){
                return res.status(400).json({error: error.message});
            }

            return res.status(200).json({
                message: 'Sign in successful',
                user: data.user,
                session: data.session,
            });
        }
        catch(error){
            console.error("Server error",error);
            return res.status(500).json({error: "Internal server error"});
        }
    });

    export {router as authRouter};
