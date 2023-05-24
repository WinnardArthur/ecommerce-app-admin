import { mongooseConnect } from "@/lib/mongoose";
import { Category } from "@/models/Category";
import { getServerSession } from 'next-auth'; 
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(req, res);
    
    if(method === 'GET') {
        const categories = await Category.find({}).populate('parent');
        res.json(categories)
    }

    if(method === 'POST') {
        const { name, parentCategory, properties } = req.body;
        const categoryDoc = await Category.create({
            name, 
            parent: parentCategory,
            properties,
        });
        res.json(categoryDoc);
    }

    if(method === 'PATCH') {
        const { name, parentCategory, properties, _id } = req.body;
        const categoryDoc = await Category.updateOne({ _id }, {
            name,
            parent: parentCategory,
            properties,
        });
        res.json(categoryDoc);
    }
    
    if(method === 'DELETE'){
        const { id } = req.query;

        await Category.deleteOne({_id: id});
        res.json('Ok')
    }
}