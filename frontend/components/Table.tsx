"use client"
import React, { useState, useEffect } from 'react';
import { User } from "@/types/User";
import EditForm from './EditForm';

interface TableProps {
    users: User[];
    deleteUser: (userId: string) => void;
}

const Table: React.FC<TableProps> = React.memo(({ users, deleteUser })=> {
  const [editUser, setEditUser] = useState<User>();
  
console.log(users);
  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">Name</th>
            <th scope="col" className="px-6 py-3">Age</th>
            <th scope="col" className="px-6 py-3">Occupation</th>
            <th scope="col" className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {user.name}
              </th>
              <td className="px-6 py-4">
                {user.age}
              </td>
              <td className="px-6 py-4">
                {user.occupation}
              </td>
              <td className="px-6 py-4 space-x-5">
                <button className='bg-red-500 text-white px-5 py-2 rounded-md' onClick={()=>deleteUser(user.id)}>Delete</button>
                <button className='bg-blue-500 text-white px-5 py-2 rounded-md' onClick={()=>setEditUser(user)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editUser &&
        <EditForm editUser={editUser} setEditUser={setEditUser}/>
      }
    </div>
  );
})

export default Table;