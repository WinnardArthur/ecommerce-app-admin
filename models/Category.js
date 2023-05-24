import { Schema, model, models, Types } from "mongoose";

const categorySchema = new Schema({
    name: {type: String, required: true},
    parent: {
        type: Types.ObjectId,
        ref: 'Category',
        required: false
    },
    properties: [
        {
            type: Object
        }
    ]
})

export const Category = models?.Category || model('Category', categorySchema);
