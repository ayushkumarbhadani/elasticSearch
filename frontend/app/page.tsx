"use client"
import Table from "@/components/Table";
import { useEffect, useState } from "react";
import { User } from "@/types/User";

const Home = ()=>{
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  

  const fetchUsers = ()=>{
    fetch(`http://localhost:3001/api/users?page=${currentPage}&size=${10}`)
    .then(response => response.json())
    .then(data => setUsers(data))
    .catch(error => console.error('Error fetching users:', error));
  }

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const searchUser = (q:string)=>{
    fetch(`http://localhost:3001/api/users/search?q=${q}`)
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }

  const deleteUser = (userId: string) => {
    fetch(`http://localhost:3001/api/users/${userId}`, {
      method: 'DELETE'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      })
      .catch(error => console.error('Error deleting user:', error));
  }
  
  return(
    <main>
      <div className="max-w-md mx-auto my-5 px-5">   
          <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
          <div className="flex flex-wrap gap-2">
              {search && 
              <button className="border rounded-md p-3 hover:bg-gray-200 transition-color duration-300 ease-in-out"
               onClick={()=>{
                  setSearch("");
                  fetchUsers();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={16} height={16} fill="currentColor"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"/></svg>
              </button>
              }
              <div className="flex flex-1 items-center gap-2 border rounded-md py-2 px-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={16} height={16} fill="currentColor"><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>
                <input type="text" className="w-full focus:outline-none" placeholder="Search" onChange={(e)=>setSearch(e.target.value)} value={search}/>
              </div>
              <button className="bg-blue-500 max-md:flex-1 text-white px-5 py-2 rounded-md w-fit" onClick={()=>searchUser(search)}>Search</button>
          </div>
      </div>
      <Table users={users} deleteUser={deleteUser}/>
      <div className="space-x-2 text-center p-5">
        <button className="bg-blue-500 disabled:bg-gray-500 p-2 px-5 text-white rounded-md text-sm" disabled={currentPage<=1} onClick={()=>setCurrentPage(prev=>prev>1 ? prev-1 : 1)}>Previous</button>
        <button className="bg-blue-500 p-2 px-5 text-white rounded-md text-sm" onClick={()=>setCurrentPage(prev=>prev+1)}>Next</button>
      </div>
    </main>
  )
}

export default Home;