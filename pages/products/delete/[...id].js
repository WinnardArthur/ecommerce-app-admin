import { useEffect, useState } from "react";
import Layout from "@/components/layout";
import axios from "axios";
import { useRouter } from "next/router";

export default function DeleteProductPage () {
    const [productInfo, setProductInfo] = useState();
    const router = useRouter();
    const { id } = router.query;

    useEffect(() => {
        if (!id) return;
        axios.get(`/api/products?id=${id}`).then(response => {
            setProductInfo(response.data);
        })
    }, [id])

    function goBack () {
        router.push('/products')
    }

    async function deleteProduct () {
        await axios.delete(`/api/products?id=${id}`).then(response => {
            if (response.data.success) {
                return goBack();
            }
            return;
        });
    }


    return (
        <Layout>
            <h1 className="text-center">Do you really want to delete "{productInfo?.title}"?</h1>

            <div className="flex gap-2 justify-center mt-4">
                <button className='btn-red' onClick={deleteProduct}>Yes</button>
                <button className='btn-default' onClick={goBack}>No</button>
            </div>
        </Layout>
    )
}