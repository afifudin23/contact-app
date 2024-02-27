import mongoose from "mongoose";

export const Hk = mongoose.model("Hk", {
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    dapartement: {
        type: String
    },
    email: {
        type: String
    }
})
