import express from "express";
import {creatClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const supabase_url = process.env.SUPABASE_URL;
const supabase_api = process.env.SUPABASE_API;
const supabase = creatClient(supabase_url, supabase_api);

router.post('/signup', async(req,res) =>{
    try{
        const {email,password,name} = req.body;

        if(!email|| !password || !name){
            return res.status(400).json({error: "All fields are required"});
        }

        const {data,error} = await supabase.auth.signUp({
            email,
            password,
            options:{
                data:{
                    name,
                }
            }
        });

        if(error){
            return res.status(400).json({error:error.message});
        }

        const {error:profileError} = await supabase
            .from('profiles')
            .insert({
                id: data.user.id,
                name,
                email,
                created_at: new Date(),
            });
        if(profileError){
            return res.status(400).json({error: profileError.message});
        }

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
    try{
        const{email,password} = req.body;
        if(!email || !password){
            return res.status(400).json({error: "Email and password are required"});
        }
        const {data,error} = await supabase.auth.signInWithPassword({
            email,
            password
        });

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