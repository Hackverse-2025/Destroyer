import zod from "zod"
export const JWT_secret="secret"

export const signupSchema = zod.object({
  email: zod.string().email(),
  password: zod.string().min(4),
  name: zod.string().min(3)
})  

export const loginSchema = zod.object({
    email:zod.string().email(), 
    password:zod.string().min(4)
})

export const RoomSchema = zod.object({  
    room:zod.string().min(3).max(10)
})
