import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
            username:{
                type:String,
                required:true,
            },
            email: {
                type:String,
                required:true,
                unique:true,
            },
            password:{
                type: String , 
                required: true,

            },
            isAdmin: {
                type:Boolean,
                required:true,
                default:false,
            },
            bankAccounts: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'BankAccount',
                },
            ],
    },
    {timestamps:true}
    
)

const User = mongoose.model('user',userSchema)
export default User
