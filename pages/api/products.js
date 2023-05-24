import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { isAdminRequest } from "./auth/[...nextauth]";


export default async function handle(req, res) {
    const { method } = req; 
    await mongooseConnect();
    await isAdminRequest(req, res);


    if(method === 'GET') {
        if(req.query?.id) {
            return res.json(await Product.findOne({_id: req.query.id}))
        } else {
            console.log('hello')
            return res.json(await Product.find());
        }
    }

    if(method === 'POST') {
        const { title, description, price, category, properties } = req.body;

        const productDoc = await Product.create({
            title, description, price, category, properties
        })
        res.json(productDoc)
    }

    if(method === 'PATCH') {
        const { title, description, price, category, _id, properties } = req.body;

        await Product.updateOne({_id}, {title, description, price, category, properties})
        res.json(true);
    }

    if(method === 'DELETE') {
        const { id } = req.query;
        if(id) {
            await Product.deleteOne({_id: id});
            res.json({success: true});
        }
    }
}