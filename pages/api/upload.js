import { mongooseConnect } from '@/lib/mongoose';
import multiparty from 'multiparty';
import { isAdminRequest } from './auth/[...nextauth]';

export default async function handle(req, res) {
    await mongooseConnect();
    await isAdminRequest(req, res);

    console.log(req.body)
    const form = new multiparty.Form();
    form.parse(req, async (err, fields, files) => {
        console.log('fields', files);
        res.json('ok')
    })
}

export const config = {
    api: {bodyParser: false}
}