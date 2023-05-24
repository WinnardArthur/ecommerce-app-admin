import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function ProductForm({ 
    _id,
    title: existingTitle, 
    description: existingDescription, 
    price: existingPrice,
    category: existingCategory,
    properties: existingProperties,
    images
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('')
  const [categories, setCategories] = useState([]);
  const [productProperties, setProductProperties] = useState({});

  const router = useRouter();

  useEffect(() => {
    axios.get('/api/categories').then(result => {
      setCategories(result.data);
    })
  }, [])

  useEffect(() => {
    if (existingTitle) {
      setTitle(existingTitle)
      setCategory(existingCategory)
      setDescription(existingDescription)
      setPrice(existingPrice)
      setProductProperties(existingProperties)
    }
  }, [existingTitle])

  // Save product in db 
  const createProduct = async (e) => {
    e.preventDefault();
    const data = {
      title,
      category,
      description,
      price,
      properties: productProperties
    };

    // update
    if(_id) {
        await axios.patch(`/api/products`, {...data, _id});
    } else {
    // Create
        await axios.post('/api/products', data);
    }
    router.push('/products');
  }

  // Upload image function
  async function uploadImages (e) {
    const files = e.target?.files;

    if(files?.length > 0) {
      const data = new FormData();

      for (const file of files) {
        data.append('file', file)
      }

      const res = await axios.post('/api/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }); 

      console.log(res.data);
    }
  }



  // Display properties and parent's properties
  const propertiesToFill = [];
  if (categories.length >  0 && category) {
    let catInfo = categories.find(({ _id }) => _id === category)
    propertiesToFill.push(...catInfo?.properties);
    while (catInfo?.parent?._id) {
      const parentCat = categories.find(({ _id }) => _id === catInfo?.parent?._id)
      propertiesToFill.push(...parentCat.properties)
      catInfo = parentCat; 
    }
  }  

  // set product property
  function setProductProp(propName, value) {
    setProductProperties(prev => {
      const newProductProps = { ...prev };
      newProductProps[propName] = value;
      return newProductProps;
    })
  }


  return (
      <form onSubmit={createProduct}>        
        <label>Product name</label>
        <input type="text" placeholder="product name" value={title} onChange={e => setTitle(e.target.value)}/>
        
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Uncategorized</option>
          {categories.length && categories.map(c => (
            <option value={c._id} key={c.name}>{c.name}</option>
          ))}
      </select>
      
      {propertiesToFill.length > 0 && propertiesToFill.map(p => (
        <div key={p.name} className='flex gap-1'>
          <div>{p.name}</div>
          <select
            value={productProperties?.[p.name] || ''}
            onChange={(e) => setProductProp(p.name, e.target.value)}>
            {p.values.map(v => (
              <option key={v} value={v}>{v}</option>  
            ))}
          </select>
        </div>
      ))}

        <label>Photos</label>
        <div className='mb-2'>
          <label className="w-24 h-24 flex gap-y-1 flex-col items-center justify-center rounded-md text-sm text-gray-500 bg-gray-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <div>
              Upload
            </div>

            <input type='file' className='hidden' onChange={uploadImages}/>
          </label>
          {!images?.length && (
            <div>No photos for this product</div>
          )}
        </div>

        <label>Product description</label>
        <textarea placeholder="description" value={description} onChange={e => setDescription(e.target.value)}></textarea>

        <label>Price (in USD)</label>
        <input type="number" placeholder="price" value={price} onChange={e => setPrice(e.target.value)}/>
        
        <button className="btn-primary" type='submit'>Save</button>
      </form>
  )
}
