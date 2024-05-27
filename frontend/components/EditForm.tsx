import { User } from "@/types/User";
import { ChangeEvent, useState } from "react";

interface EditFormProps {
    editUser: User;
    setEditUser: React.Dispatch<React.SetStateAction<User | undefined>>
  }

  const EditForm: React.FC<EditFormProps> = ({ editUser, setEditUser }) => {

    const [formData, setFormData] = useState(editUser);
    const [errors, setErrors] = useState<{ name?: string; age?: string; occupation?: string }>({});

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [id]: value }));
      };

    const validate = () => {
        console.log("Inside validate");
        let valid = true;
        let newErrors: { name?: string; age?: string; occupation?: string } = {};
    
        if (!formData.name) {
          valid = false;
          newErrors.name = 'Name is required';
        }
        if (!formData.age || isNaN(Number(formData.age))) {
          valid = false;
          newErrors.age = 'Valid age is required';
        }
        if (!formData.occupation) {
          valid = false;
          newErrors.occupation = 'Occupation is required';
        }
    
        setErrors(newErrors);
        return valid;
      };
      
      const UpdateData = async () => {
        if (!validate()) return;
    
        try {
            console.log("Inside try");
          const response = await fetch(`http://localhost:3001/api/users/${formData.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
    
          if (response.ok) {
            const updatedUser = await response.json();
            setEditUser(undefined);
          } else {
            console.error('Failed to update user');
          }
        } catch (error) {
          console.error('Error updating user:', error);
        }
      };

    return(
        <div className="fixed top-0 left-0 h-screen w-screen bg-black/80 flex items-center justify-center p-5">
            <div className="bg-white p-5 rounded-md max-w-screen-sm w-full">
                <div className="mb-5">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name:</label>
                    <input type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none" required  value={formData.name} onChange={handleChange}/>
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="mb-5">
                    <label htmlFor="age" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Age:</label>
                    <input type="text" id="age" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none" required  value={formData.age} onChange={handleChange}/>
                    {errors.age && <p className="text-red-500 text-sm">{errors.age}</p>}
                </div>
                <div className="mb-5">
                    <label htmlFor="occupation" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Occupation:</label>
                    <input type="text" id="occupation" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 outline-none" required  value={formData.occupation} onChange={handleChange}/>
                    {errors.occupation && <p className="text-red-500 text-sm">{errors.occupation}</p>}
                </div>
                <div className="mb-5 text-right space-x-2">
                    <button className=' text-red-500 px-5 py-2 rounded-md' onClick={()=>{setEditUser(undefined)}}>Close</button>
                    <button className='bg-blue-700 text-white px-5 py-2 rounded-md' onClick={UpdateData}>Update</button>
                </div>
            </div>
        </div>
    )
}

export default EditForm;