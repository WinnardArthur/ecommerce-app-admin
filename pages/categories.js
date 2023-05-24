import {useEffect, useState} from 'react'
import Layout from '@/components/layout'
import axios from 'axios';
import { withSwal } from 'react-sweetalert2';

function Categories({swal}) {
    const [name, setName] = useState('');
    const [parentCategory, setParentCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [editedCategory, setEditedCategory] = useState(null);
    const [properties, setProperties] = useState([]);


    // Fetch categories
    function fetchCategories () {
        axios.get('/api/categories').then(result => {
            setCategories(result.data);
        })
    }
    useEffect(() => {
        fetchCategories()
    }, []);


    // Submit/Save a category
    async function saveCategory(e) {
        e.preventDefault();
        
        const data = {
            name,
            properties: properties.map(p => (
                {
                    name: p.name,
                    values: p.values.split(','),
                }))
        };
        if(parentCategory) {
            data.parentCategory = parentCategory
        }
        if (editedCategory) {
            await axios.patch(`/api/categories`, {...data, _id: editedCategory._id});
            setEditedCategory(null);
        } else {
            await axios.post('/api/categories', data)
        }
        setName('');
        setParentCategory('');
        setProperties([]);
        fetchCategories();
    }

    // Edit a category
    function editCategory (category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id || "");
        setProperties(category.properties.map(({ name, values }) => ({
            name,
            values: values.join(',')
        })))
    }

    // Delete categories
    function deleteCategory(category) {
        swal.fire({
            title: 'Are you sure?',
            text: `Do you want to delete ${category.name}`,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Yes, Delete!',
            confirmButtonColor: '#d55',
            reverseButtons: true
        }).then(async result => {
            if(result.isConfirmed) {
                await axios.delete(`/api/categories?id=${category._id}`)
                fetchCategories();
            }
        })
    }

    console.log('cat', categories)

    // Add a property
    function addProperty () {
        setProperties(prev => {
            return [...prev, {name: '', values: ''}]
        })
    }
    
    // Input Name changes
    function handlePropertyNameChange(index, property, newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties; 
        })
    }

    // Input Values changes
    function handlePropertyValueChange(index, property, newValues) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties; 
        })
    }

    function removeProperty(indexToRemove) {
        setProperties(prev => {
            const newProperties = [...prev];
            return newProperties.filter((p, pIndex) => {
                return pIndex !== indexToRemove;
            });
        })
    }

  return (
    <Layout>
        <h1>Categories</h1>
        <label>{editedCategory ? `Edit category ${editedCategory.name}` : 'Create new category'}</label>
        <form onSubmit={saveCategory} className=''>
              <div className='flex gap-1'>
                <input 
                    value={name} 
                    type="text" 
                    placeholder="Category name" 
                    onChange={e => setName(e.target.value)} 
                    className=''
                />
                <select className='' value={parentCategory} onChange={e => setParentCategory(e.target.value)}>
                    <option value="">No parent category</option>
                    {categories?.length && categories.map(category => (
                        <option key={category._id} value={category._id}>{category.name}</option>
                    ))}
                </select>   
              </div>

              <div className='mb-2'>
                  <label className='block'>Properties</label>
                  <button type='button' onClick={addProperty} className='btn-default text-sm mb-2'>Add new property</button>
                  {properties?.length > 0 && properties?.map((property, index) => (
                      <div key={index} className='flex gap-1 mb-2'>
                          <input
                            type="text" 
                              value={property.name}
                              placeholder='property name (example: color)'
                              onChange = {(e) => handlePropertyNameChange(index, property, e.target.value)}
                              className='mb-0'
                          /> 
                          <input 
                              type="text"
                              value={property.values}
                              onChange={(e) => handlePropertyValueChange(index, property, e.target.value)}
                              placeholder='values, comma separated'
                              className='mb-0'
                          />
                          <button
                              type="button"
                              className="btn-default"
                              onClick={() => removeProperty(index)}
                          >Remove</button>
                      </div> 
                  ))}
              </div>
              <div className='flex gap-1'>
                {editedCategory && ( 
                      <button
                          onClick={() => {
                              setEditedCategory(null);
                              setName('');
                              setParentCategory('');
                              setProperties([]);
                          }}
                          type='button'
                          className='btn-default py-1'
                      >Cancel</button>
                )} 
                <button type='submit' className='btn-primary py-1'>Save</button>
              </div>
        </form>

          {!editedCategory &&
            <table className='basic mt-4'>
                <thead>
                    <tr>
                        <th>Category name</th>
                        <th>Parent category</th>
                    </tr>
                </thead>
                <tbody>
                    {categories?.length && categories.map(category => (
                        <tr key={category.name}>
                            <td>{category.name}</td>
                            <td>{category.parent?.name}</td>
                            <td>
                                <button onClick={() => editCategory(category)} className='btn-primary mr-1'>Edit</button>
                                <button 
                                    onClick={() => deleteCategory(category)}
                                    className='btn-primary'>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          }
    </Layout>
  )
}

export default withSwal(({swal}, ref) => {
    return (
        <Categories swal={swal}/>
    )
})